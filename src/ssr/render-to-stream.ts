import { Effect, Layer, ManagedRuntime, pipe, Scope, Stream } from "effect";
import type { JSXNode } from "@/jsx-runtime";
import { FRAGMENT } from "@/jsx-runtime";
import { AsyncComponentError, SSRRenderError } from "@/shared/errors";
import {
	camelToKebab,
	getHTMLAttributeName,
	isEffect,
	isEventHandler,
	isFragment,
	isFunctionComponent,
	isHTMLElementType,
	isIterable,
	isJSXElement,
	isNullish,
	isPrimitive,
	isStream,
	isVoidElement,
	shouldAppendPx,
	styleObjectToString,
} from "@/shared/jsx-utils";
import { RenderContext } from "@/shared/render-context";
import { toEscapedAttribute, toEscapedText } from "./html-escape";
import type {
	HydrationManifest,
	HydrationMetadata,
	HydrationPriority,
	SSROptions,
} from "./index";
import { awaitFirstValue, normalizeJSXNode } from "./stream-utils";

// ============================================================================
// SSR Context
// ============================================================================

/**
 * Internal context for server-side rendering
 */
class SSRContext {
	readonly options: SSROptions;
	readonly manifest: HydrationManifest;
	readonly streamIdCounter: { current: number };
	readonly hydrationIdCounter: { current: number };

	constructor(options: SSROptions = {}) {
		this.options = {
			includeDoctype: false,
			enableHydration: true,
			enableProgressiveHydration: true,
			defaultHydrationPriority: "visible",
			streamTimeout: 5000,
			...options,
		};

		this.manifest = {
			hydrationPoints: new Map(),
			idCounter: 0,
		};

		this.streamIdCounter = { current: 0 };
		this.hydrationIdCounter = { current: 0 };
	}

	nextHydrationId(): string {
		return String(this.hydrationIdCounter.current++);
	}

	nextStreamId(): string {
		return String(this.streamIdCounter.current++);
	}

	registerHydrationPoint(metadata: HydrationMetadata): void {
		this.manifest.hydrationPoints.set(metadata.id, metadata);
	}
}

// ============================================================================
// Attribute Serialization
// ============================================================================

/**
 * Serializes a style value to a CSS string
 */
function serializeStyle(style: unknown): string {
	if (typeof style === "string") {
		return toEscapedAttribute(style);
	}

	if (style && typeof style === "object" && !Array.isArray(style)) {
		return styleObjectToString(style as Record<string, unknown>);
	}

	return "";
}

/**
 * Serializes props to HTML attributes string
 */
function serializeAttributes(
	props: Record<string, unknown>,
	context: SSRContext,
): string {
	const attrs: string[] = [];

	for (const [key, value] of Object.entries(props)) {
		// Skip special props
		if (
			key === "children" ||
			key === "key" ||
			key === "ref" ||
			isEventHandler(key)
		) {
			continue;
		}

		// Skip nullish values
		if (value === null || value === undefined) {
			continue;
		}

		// Handle style specially
		if (key === "style") {
			const styleStr = serializeStyle(value);
			if (styleStr) {
				attrs.push(`style="${styleStr}"`);
			}
			continue;
		}

		// Get HTML attribute name
		const attrName = getHTMLAttributeName(key);

		// Handle boolean attributes
		if (typeof value === "boolean") {
			if (value) {
				attrs.push(`${attrName}=""`);
			}
			continue;
		}

		// Handle streams and effects (SSR awaits first value)
		if (isStream(value) || isEffect(value)) {
			// Mark this as a stream position for hydration
			if (context.options.enableHydration) {
				const streamId = context.nextStreamId();
				attrs.push(`data-stream-${attrName}="${streamId}"`);
			}
			// Skip the actual stream value during SSR
			continue;
		}

		// Regular attributes
		const escaped = toEscapedAttribute(value);
		attrs.push(`${attrName}="${escaped}"`);
	}

	// Add hydration attributes if enabled
	if (context.options.enableHydration && !isEventHandler("onClick")) {
		// We'll add hydration IDs in renderElement when appropriate
	}

	return attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
}

// ============================================================================
// Core Rendering Functions
// ============================================================================

/**
 * Renders a JSXNode to an HTML string
 */
function renderNodeToString(
	node: JSXNode,
	context: SSRContext,
): Effect.Effect<string, SSRRenderError | AsyncComponentError> {
	// Handle nullish values
	if (isNullish(node)) {
		return Effect.succeed("");
	}

	// Handle primitives
	if (isPrimitive(node)) {
		return Effect.succeed(toEscapedText(node));
	}

	// Handle iterables (arrays)
	if (isIterable(node)) {
		// Map over children and collect effects
		const children = Array.from(node as Iterable<JSXNode>);
		const effects = children.map(child => renderNodeToString(child, context));

		// Use Effect.all to run all child renders and join the results
		return Effect.map(
			Effect.all(effects),
			(parts) => parts.join("")
		);
	}

	// Handle Effects - await the result and render
	if (isEffect(node)) {
		// First run the Effect to get the JSX, then render that JSX
		// We need to use flatMap to chain the effects properly
		return Effect.flatMap(
			node as Effect.Effect<JSXNode>,
			(resolvedNode) => renderNodeToString(resolvedNode, context)
		);
	}

	// Handle Streams - await first value
	if (isStream(node)) {
		return pipe(
			awaitFirstValue(
				node as Stream.Stream<JSXNode>,
				context.options.streamTimeout,
			),
			Effect.flatMap((firstValue) => {
				// Add stream marker for hydration if enabled
				if (context.options.enableHydration) {
					const streamId = context.nextStreamId();
					return pipe(
						renderNodeToString(firstValue, context),
						Effect.map(
							(content) =>
								`<span data-stream-id="${streamId}">${content}</span>`,
						),
					);
				}
				return renderNodeToString(firstValue, context);
			}),
		);
	}

	// Handle JSX elements
	if (isJSXElement(node)) {
		const { type, props } = node;

		// Handle fragments
		if (isFragment(type)) {
			const children = (props as any).children;
			return renderNodeToString(children, context);
		}

		// Handle HTML elements
		if (isHTMLElementType(type)) {
			return renderElement(type, props, context);
		}

		// Handle function components
		if (isFunctionComponent(type)) {
			return renderComponent(type, props, context);
		}

		// Invalid element type
		return Effect.fail(
			new SSRRenderError({
				cause: type,
				message: `Invalid element type: ${type}`,
				node,
			}),
		);
	}

	// Unknown node type
	return Effect.fail(
		new SSRRenderError({
			cause: node,
			message: `Unknown node type: ${typeof node}`,
			node,
		}),
	);
}

/**
 * Renders an HTML element to string
 */
function renderElement(
	type: string,
	props: object,
	context: SSRContext,
): Effect.Effect<string, SSRRenderError | AsyncComponentError> {
	const tagName = type.toLowerCase();
	const isVoid = isVoidElement(tagName);
	const attributes = serializeAttributes(
		props as Record<string, unknown>,
		context,
	);

	// Add hydration ID if this element has event handlers
	let hydrationAttr = "";
	if (context.options.enableHydration) {
		const hasHandlers = Object.keys(props).some(isEventHandler);
		if (hasHandlers) {
			const hid = context.nextHydrationId();
			hydrationAttr = ` data-hid="${hid}"`;

			// Register hydration point
			context.registerHydrationPoint({
				id: hid,
				type: tagName,
				priority: context.options.defaultHydrationPriority || "visible",
				hasHandlers: true,
			});
		}
	}

	// Build opening tag
	const openingTag = `<${type}${attributes}${hydrationAttr}>`;

	// Void elements don't have children or closing tags
	if (isVoid) {
		return Effect.succeed(openingTag);
	}

	// Render children
	const children = (props as any).children;
	return pipe(
		renderNodeToString(children, context),
		Effect.map((childrenHtml) => `${openingTag}${childrenHtml}</${type}>`),
	);
}

/**
 * Renders a function component to string
 */
function renderComponent(
	component: (props: object) => JSXNode,
	props: object,
	context: SSRContext,
): Effect.Effect<string, SSRRenderError | AsyncComponentError> {
	// Build component boundary markers if hydration is enabled
	let startMarker = "";
	let endMarker = "";

	if (context.options.enableHydration) {
		const hid = context.nextHydrationId();
		const componentName = component.name || "Anonymous";

		startMarker = `<!-- hid:${hid} -->`;
		endMarker = `<!-- /hid:${hid} -->`;

		// Register hydration point
		context.registerHydrationPoint({
			id: hid,
			type: componentName,
			priority: context.options.defaultHydrationPriority || "visible",
		});

		// Add data attributes for progressive hydration
		if (context.options.enableProgressiveHydration) {
			const priority = context.options.defaultHydrationPriority || "visible";
			startMarker = `<!-- hid:${hid} --><div data-hid="${hid}" data-component="${componentName}" data-hydrate-priority="${priority}">`;
			endMarker = `</div><!-- /hid:${hid} -->`;
		}
	}

	// Call the component function
	let result: JSXNode;
	try {
		result = component(props);
	} catch (error) {
		// Wrap synchronous component errors
		return Effect.fail(
			new AsyncComponentError({
				cause: error,
				componentName: component.name || "Anonymous",
				props,
			}),
		);
	}

	// Render the component result and wrap with markers
	return Effect.map(
		renderNodeToString(result, context),
		(content) => `${startMarker}${content}${endMarker}`
	);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Renders a JSX tree to a Stream of HTML strings
 */
export function renderToStream(
	node: JSXNode,
	options?: SSROptions,
): Stream.Stream<string> {
	const context = new SSRContext(options);

	// Create the rendering effect
	const renderEffect = Effect.gen(function* () {
		// Add DOCTYPE if requested
		let html = "";
		if (context.options.includeDoctype) {
			html = "<!DOCTYPE html>";
		}

		// Render the tree
		const content = yield* renderNodeToString(node, context);
		html += content;

		return html;
	});

	// Convert to stream, catching errors and converting them to die
	return Stream.fromEffect(
		renderEffect.pipe(
			Effect.catchAll((error) => {
				console.error("SSR Error:", error);
				return Effect.die(error);
			}),
		),
	);
}

/**
 * Renders a JSX tree to a single HTML string
 */
export function renderToString(
	node: JSXNode,
	options?: SSROptions,
): Effect.Effect<string> {
	return pipe(
		renderToStream(node, options),
		Stream.runCollect,
		Effect.map((chunks) => Array.from(chunks).join("")),
	);
}
