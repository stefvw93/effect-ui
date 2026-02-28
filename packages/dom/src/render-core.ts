import {
	InvalidElementTypeError,
	isStream,
	nextStreamId,
	normalizeToStream,
	RenderContext,
	type RenderError,
	type StreamSubscriptionError,
} from "@effect-ui/core";
import type { JSXChild } from "@effect-ui/html-types";
import { FRAGMENT } from "@effect-ui/html-types";
import { Effect, Stream } from "effect";
import { setElementProps } from "./dom";

/**
 * Main rendering function that converts JSXNode to DOM nodes.
 * Handles all JSXNode types and sets up reactive subscriptions.
 */
export function renderNode(
	node: JSXChild,
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
					type as (props: object) => JSXChild,
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
function flattenChildren(node: JSXChild): readonly JSXChild[] {
	const result: JSXChild[] = [];

	function flatten(item: JSXChild): void {
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
			for (const child of item as Iterable<JSXChild>) {
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
	children: readonly JSXChild[],
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
				const stream = normalizeToStream(child) as Stream.Stream<JSXChild>;
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
					const stream = normalizeToStream(child) as Stream.Stream<JSXChild>;
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
	component: (props: object) => JSXChild,
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

/**
 * Result of rendering a JSXNode - can be single node, multiple nodes, or null
 */
type RenderResult = Node | readonly Node[] | null;

// ============================================================================
// Reactive Children Handling
// ============================================================================

/**
 * Handles a child that is a Stream by setting up comment markers and subscriptions
 */
function handleStreamChild(
	stream: Stream.Stream<JSXChild>,
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
	newNode: JSXChild,
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
