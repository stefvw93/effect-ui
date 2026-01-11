import {
	Context,
	Data,
	Effect,
	Layer,
	ManagedRuntime,
	type Scope,
	Stream,
} from "effect";
import type { JSXNode } from "@/jsx-runtime";
import { FRAGMENT } from "@/jsx-runtime";

// ============================================================================
// Error Types
// ============================================================================

/**
 * Error thrown when JSXNode has invalid type (not string, FRAGMENT, or function)
 */
export class InvalidElementTypeError extends Data.TaggedError(
	"InvalidElementTypeError",
)<{
	readonly type: unknown;
	readonly message: string;
}> {}

/**
 * Error thrown when stream subscription or execution fails
 */
export class StreamSubscriptionError extends Data.TaggedError(
	"StreamSubscriptionError",
)<{
	readonly cause: unknown;
	readonly context: string;
}> {}

/**
 * Error thrown for general rendering failures
 */
export class RenderError extends Data.TaggedError("RenderError")<{
	readonly cause: unknown;
	readonly message: string;
}> {}

// ============================================================================
// Services
// ============================================================================

/**
 * Service for managing rendering context including runtime, scope, and stream IDs
 */
export class RenderContext extends Context.Tag("RenderContext")<
	RenderContext,
	{
		readonly runtime: ManagedRuntime.ManagedRuntime<never, never>;
		readonly scope: Scope.Scope;
		readonly streamIdCounter: { current: number };
	}
>() {}

/**
 * Result of rendering a JSXNode - can be single node, multiple nodes, or null
 */
type RenderResult = Node | readonly Node[] | null;

// ============================================================================
// Public API
// ============================================================================

/**
 * Cleanup handle returned from mount that allows unmounting
 */
export interface MountHandle {
	/**
	 * Unmounts the rendered tree and cleans up all resources.
	 * Returns an Effect that completes when cleanup is done.
	 * Safe to call multiple times (idempotent).
	 */
	unmount(): Effect.Effect<void>;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a fresh ManagedRuntime for a mount operation
 */
export function createMountRuntime(): ManagedRuntime.ManagedRuntime<
	never,
	never
> {
	return ManagedRuntime.make(Layer.empty as Layer.Layer<never, never>);
}

/**
 * Generates next unique stream ID
 */
function nextStreamId(): Effect.Effect<number, never, RenderContext> {
	return Effect.gen(function* () {
		const context = yield* RenderContext;
		return ++context.streamIdCounter.current;
	});
}

/**
 * Checks if value is a Stream
 */
function isStream(value: unknown): value is Stream.Stream<unknown> {
	return (
		typeof value === "object" && value != null && Stream.StreamTypeId in value
	);
}

/**
 * Normalizes Effect/Stream to Stream
 */
function normalizeToStream<A>(
	value: A | Effect.Effect<A> | Stream.Stream<A>,
): Stream.Stream<A> {
	if (isStream(value)) {
		return value;
	}
	if (Effect.isEffect(value)) {
		return Stream.fromEffect(value);
	}
	return Stream.make(value);
}

// ============================================================================
// Core Rendering Functions
// ============================================================================

/**
 * Main rendering function that converts JSXNode to DOM nodes.
 * Handles all JSXNode types and sets up reactive subscriptions.
 */
export function renderNode(
	node: JSXNode,
): Effect.Effect<
	RenderResult,
	InvalidElementTypeError | StreamSubscriptionError | RenderError,
	RenderContext
> {
	return Effect.gen(function* () {
		// AC2: Handle primitives
		if (
			typeof node === "string" ||
			typeof node === "number" ||
			typeof node === "bigint"
		) {
			return document.createTextNode(String(node));
		}

		// AC2: Boolean, null, undefined, void -> render nothing
		if (typeof node === "boolean" || node === null || node === undefined) {
			return null;
		}

		// Check for Stream/Effect first (before iterables, since Stream might be iterable)
		if (isStream(node) || Effect.isEffect(node)) {
			// Streams/Effects as direct children need to be wrapped in markers
			const stream = normalizeToStream(node);
			const fragment = document.createDocumentFragment();
			const markers = yield* handleStreamChild(stream, fragment);
			return markers;
		}

		// AC3: Handle iterables (including arrays)
		if (
			typeof node === "object" &&
			Symbol.iterator in node &&
			!("type" in node)
		) {
			const flattened = flattenChildren(node);
			return yield* renderChildren(flattened);
		}

		// Handle JSX elements: { type, props }
		if (
			typeof node === "object" &&
			"type" in node &&
			!(Symbol.iterator in node)
		) {
			const element = node as { type: unknown; props: object };
			const { type, props } = element;

			// AC6: Fragment
			if (type === FRAGMENT) {
				return yield* renderFragment(props);
			}

			// AC4: Element (string type)
			if (typeof type === "string") {
				return yield* renderElement(type, props);
			}

			// AC5: Function component
			if (typeof type === "function") {
				return yield* renderComponent(
					type as (props: object) => JSXNode,
					props,
				);
			}

			// AC23: Invalid element type
			return yield* Effect.fail(
				new InvalidElementTypeError({
					type,
					message: `Invalid JSXNode type: expected string, FRAGMENT, or function, got ${typeof type}`,
				}),
			);
		}

		// Shouldn't reach here, but handle gracefully
		return null;
	});
}

/**
 * Flattens iterable children recursively
 */
function flattenChildren(node: JSXNode): readonly JSXNode[] {
	const result: JSXNode[] = [];

	function flatten(item: JSXNode): void {
		// Don't try to iterate streams/effects
		if (isStream(item) || Effect.isEffect(item)) {
			result.push(item);
			return;
		}

		if (
			typeof item === "object" &&
			item !== null &&
			Symbol.iterator in item &&
			!("type" in item)
		) {
			for (const child of item as Iterable<JSXNode>) {
				flatten(child);
			}
		} else {
			result.push(item);
		}
	}

	flatten(node);
	return result;
}

/**
 * Renders an array of children nodes
 */
function renderChildren(
	children: readonly JSXNode[],
): Effect.Effect<
	readonly Node[],
	InvalidElementTypeError | StreamSubscriptionError | RenderError,
	RenderContext
> {
	return Effect.gen(function* () {
		const nodes: Node[] = [];

		for (const child of children) {
			// Check if child is a stream/effect and handle specially
			if (isStream(child) || Effect.isEffect(child)) {
				const stream = normalizeToStream(child) as Stream.Stream<JSXNode>;
				const fragment = document.createDocumentFragment();
				const markers = yield* handleStreamChild(stream, fragment);
				nodes.push(...markers);
			} else {
				const result = yield* renderNode(child);

				if (result !== null) {
					if (Array.isArray(result)) {
						nodes.push(...result);
					} else {
						nodes.push(result as Node);
					}
				}
			}
		}

		return nodes;
	});
}

/**
 * Renders a fragment JSXNode (type: FRAGMENT)
 */
function renderFragment(
	props: object,
): Effect.Effect<
	readonly Node[],
	InvalidElementTypeError | StreamSubscriptionError | RenderError,
	RenderContext
> {
	return Effect.gen(function* () {
		const children = "children" in props ? props.children : undefined;

		if (children === undefined) {
			return [];
		}

		const childArray = Array.isArray(children) ? children : [children];
		return yield* renderChildren(childArray);
	});
}

/**
 * Renders an element JSXNode (type: string)
 */
function renderElement(
	type: string,
	props: object,
): Effect.Effect<
	HTMLElement,
	InvalidElementTypeError | StreamSubscriptionError | RenderError,
	RenderContext
> {
	return Effect.gen(function* () {
		// AC4: Create element using document.createElement
		const element = document.createElement(type);

		// AC4: Set attributes/props first
		yield* setElementProps(element, props);

		// AC4: Then append children
		const children = "children" in props ? props.children : undefined;

		if (children !== undefined) {
			const childArray = Array.isArray(children) ? children : [children];

			for (const child of childArray) {
				// Check if child is a stream/effect
				if (isStream(child) || Effect.isEffect(child)) {
					const stream = normalizeToStream(child) as Stream.Stream<JSXNode>;
					const markers = yield* handleStreamChild(stream, element);
					for (const marker of markers) {
						element.appendChild(marker);
					}
				} else {
					const result = yield* renderNode(child);
					if (result !== null) {
						if (Array.isArray(result)) {
							for (const node of result) {
								element.appendChild(node);
							}
						} else {
							element.appendChild(result as Node);
						}
					}
				}
			}
		}

		return element;
	});
}

/**
 * Renders a function component JSXNode (type: function)
 */
function renderComponent(
	component: (props: object) => JSXNode,
	props: object,
): Effect.Effect<
	RenderResult,
	InvalidElementTypeError | StreamSubscriptionError | RenderError,
	RenderContext
> {
	return Effect.gen(function* () {
		// AC5: Call function once with props (ephemeral execution)
		const result = component(props);

		// AC5: Handle Effect<JSXNode> or Stream<JSXNode>
		if (isStream(result) || Effect.isEffect(result)) {
			const stream = normalizeToStream(result);

			// AC22: Component returning stream treated as stream child
			// Create a temporary container to hold markers
			const fragment = document.createDocumentFragment();
			const markers = yield* handleStreamChild(stream, fragment);

			// Return all markers as array
			return markers;
		}

		// AC5: Plain JSXNode
		return yield* renderNode(result);
	});
}

// ============================================================================
// Attribute/Property Handling
// ============================================================================

/**
 * Sets all props on an element (attributes, properties, styles)
 */
function setElementProps(
	element: HTMLElement,
	props: object,
): Effect.Effect<void, StreamSubscriptionError, RenderContext> {
	return Effect.gen(function* () {
		for (const [key, value] of Object.entries(props)) {
			// AC7: Skip children prop
			if (key === "children") {
				continue;
			}

			// AC10-AC13: Special handling for style
			if (key === "style") {
				yield* handleStyle(element, value);
				continue;
			}

			// AC7: Determine if property or attribute
			if (isProperty(element, key)) {
				yield* setProperty(element, key, value);
			} else {
				yield* setAttribute(element, key, value);
			}
		}
	});
}

/**
 * Determines if a prop should be set as property vs attribute
 */
function isProperty(element: HTMLElement, name: string): boolean {
	// AC7: data-* and aria-* always treated as attributes
	if (name.startsWith("data-") || name.startsWith("aria-")) {
		return false;
	}

	// AC7: Check prototype chain
	let proto = Object.getPrototypeOf(element);
	while (proto !== null) {
		if (Object.hasOwn(proto, name)) {
			return true;
		}
		proto = Object.getPrototypeOf(proto);
	}

	return name in element;
}

/**
 * Sets a property on an element (or subscribes to stream)
 */
function setProperty(
	element: HTMLElement,
	name: string,
	value: unknown,
): Effect.Effect<void, StreamSubscriptionError, RenderContext> {
	return Effect.gen(function* () {
		// AC14: Normalize Effect/Stream
		if (isStream(value) || Effect.isEffect(value)) {
			const stream = normalizeToStream(value);
			yield* subscribeToStream(
				stream,
				(val) => {
					// AC15: null/undefined removes property
					if (val === null || val === undefined) {
						delete (element as unknown as Record<string, unknown>)[name];
					} else {
						(element as unknown as Record<string, unknown>)[name] = val;
					}
				},
				`property:${name}`,
			);
		} else {
			// Static value
			if (value !== null && value !== undefined) {
				(element as unknown as Record<string, unknown>)[name] = value;
			}
		}
	});
}

/**
 * Sets an attribute on an element (or subscribes to stream)
 */
function setAttribute(
	element: HTMLElement,
	name: string,
	value: unknown,
): Effect.Effect<void, StreamSubscriptionError, RenderContext> {
	return Effect.gen(function* () {
		// AC14: Normalize Effect/Stream
		if (isStream(value) || Effect.isEffect(value)) {
			const stream = normalizeToStream(value);
			yield* subscribeToStream(
				stream,
				(val) => {
					// AC15: null/undefined removes attribute
					if (val === null || val === undefined) {
						element.removeAttribute(name);
					} else {
						const serialized = serializeAttributeValue(val);
						if (serialized !== undefined) {
							// AC8: Boolean attributes
							if (typeof val === "boolean") {
								if (val) {
									element.setAttribute(name, "");
								} else {
									element.removeAttribute(name);
								}
							} else {
								element.setAttribute(name, serialized);
							}
						}
					}
				},
				`attribute:${name}`,
			);
		} else {
			// Static value
			const serialized = serializeAttributeValue(value);
			if (serialized !== undefined) {
				// AC8: Boolean attributes
				if (typeof value === "boolean") {
					if (value) {
						element.setAttribute(name, "");
					} else {
						element.removeAttribute(name);
					}
				} else {
					element.setAttribute(name, serialized);
				}
			}
		}
	});
}

/**
 * Serializes attribute value to string
 */
function serializeAttributeValue(value: unknown): string | undefined {
	// AC9: undefined and null -> skip
	if (value === undefined || value === null) {
		return undefined;
	}

	// AC9: Convert to string
	return String(value);
}

// ============================================================================
// Style Handling
// ============================================================================

/**
 * Handles style attribute (string, object, or stream)
 */
function handleStyle(
	element: HTMLElement,
	value: unknown,
): Effect.Effect<void, StreamSubscriptionError, RenderContext> {
	return Effect.gen(function* () {
		// AC13: Stream of styles
		if (isStream(value) || Effect.isEffect(value)) {
			const stream = normalizeToStream(value);
			yield* subscribeToStream(
				stream,
				(val) => {
					// AC13: String -> setAttribute
					if (typeof val === "string") {
						element.setAttribute("style", val);
					}
					// AC13: Object -> replace all properties
					else if (typeof val === "object" && val !== null) {
						// Clear existing styles
						element.style.cssText = "";
						// Set new styles
						for (const [key, styleValue] of Object.entries(val)) {
							if (styleValue !== undefined && styleValue !== null) {
								element.style.setProperty(
									camelToKebab(key),
									String(styleValue),
								);
							}
						}
					}
				},
				"style",
			);
			return;
		}

		// AC10: String form
		if (typeof value === "string") {
			element.setAttribute("style", value);
			return;
		}

		// AC11-AC12: Object form
		if (typeof value === "object" && value !== null) {
			yield* setStyleFromObject(element, value as Record<string, unknown>);
		}
	});
}

/**
 * Sets style from object form
 */
function setStyleFromObject(
	element: HTMLElement,
	styleObj: Record<string, unknown>,
): Effect.Effect<void, StreamSubscriptionError, RenderContext> {
	return Effect.gen(function* () {
		for (const [key, value] of Object.entries(styleObj)) {
			// AC12: Handle stream properties
			if (isStream(value) || Effect.isEffect(value)) {
				const stream = normalizeToStream(value);
				yield* subscribeToStream(
					stream,
					(val) => {
						if (val !== undefined && val !== null) {
							element.style.setProperty(camelToKebab(key), String(val));
						}
					},
					`style.${key}`,
				);
			} else {
				// AC11: Static style property
				if (value !== undefined && value !== null) {
					element.style.setProperty(camelToKebab(key), String(value));
				}
			}
		}
	});
}

/**
 * Converts camelCase to kebab-case for CSS properties
 */
function camelToKebab(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

// ============================================================================
// Stream/Effect Handling
// ============================================================================

/**
 * Subscribes to a stream and runs callback for each emission
 */
function subscribeToStream<A>(
	stream: Stream.Stream<A>,
	onValue: (value: A) => void | Promise<void>,
	_errorContext: string,
): Effect.Effect<void, StreamSubscriptionError, RenderContext> {
	return Effect.gen(function* () {
		const context = yield* RenderContext;

		// Create the stream subscription effect
		const effect = Stream.runForEach(stream, (value) =>
			Effect.sync(() => {
				onValue(value);
			}),
		);

		// Fork the effect in the scope so it's automatically interrupted when scope closes
		yield* Effect.forkIn(effect, context.scope);

		// Note: Stream runs in background via forked fiber
		// This matches the AC1 requirement that Effect completes after initial render
		// and streams run in background
	});
}

// ============================================================================
// Reactive Children Handling
// ============================================================================

/**
 * Handles a child that is a Stream by setting up comment markers and subscriptions
 */
function handleStreamChild(
	stream: Stream.Stream<JSXNode>,
	_parent: HTMLElement | DocumentFragment,
): Effect.Effect<
	readonly Node[],
	StreamSubscriptionError | RenderError | InvalidElementTypeError,
	RenderContext
> {
	return Effect.gen(function* () {
		const context = yield* RenderContext;

		// AC19: Create comment markers
		const streamId = yield* nextStreamId();
		const [startMarker, endMarker] = createStreamMarkers(streamId);

		// AC20: Set up subscription to update content through the runtime
		const effect = Stream.runForEach(stream, (value) => {
			// Update the stream child for each emission
			// Need to provide the context to updateStreamChild
			return updateStreamChild(startMarker, endMarker, value).pipe(
				Effect.provideService(RenderContext, context),
			);
		});

		// Fork the effect in the scope so it's automatically interrupted when scope closes
		yield* Effect.forkIn(effect, context.scope);

		// AC19: Return markers to be inserted
		// Note: Content will be updated asynchronously by the daemon fiber
		return [startMarker, endMarker];
	});
}

/**
 * Creates start and end comment markers for stream child
 */
function createStreamMarkers(streamId: number): readonly [Comment, Comment] {
	const startMarker = document.createComment(` stream-start-${streamId} `);
	const endMarker = document.createComment(` stream-end-${streamId} `);
	return [startMarker, endMarker];
}

/**
 * Updates stream child content between markers
 */
function updateStreamChild(
	startMarker: Comment,
	endMarker: Comment,
	newNode: JSXNode,
): Effect.Effect<
	void,
	InvalidElementTypeError | StreamSubscriptionError | RenderError,
	RenderContext
> {
	return Effect.gen(function* () {
		// AC20: Remove all nodes between markers
		removeNodesBetweenMarkers(startMarker, endMarker);

		// AC20: Render new node
		const result = yield* renderNode(newNode);

		// AC20: Insert new nodes between markers
		const parent = startMarker.parentNode;
		if (parent !== null) {
			if (result !== null) {
				if (Array.isArray(result)) {
					for (const node of result) {
						parent.insertBefore(node, endMarker);
					}
				} else {
					parent.insertBefore(result as Node, endMarker);
				}
			}
		}
	});
}

/**
 * Removes all nodes between start and end markers
 */
function removeNodesBetweenMarkers(
	startMarker: Comment,
	endMarker: Comment,
): void {
	let current = startMarker.nextSibling;
	while (current !== null && current !== endMarker) {
		const next = current.nextSibling;
		current.remove();
		current = next;
	}
}
