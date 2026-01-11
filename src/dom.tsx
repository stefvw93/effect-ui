import { Data, Effect, Stream } from "effect";
import type { JSXNode } from "@/jsx-runtime";
import { RenderContext, renderNode } from "./render-core";
import { isStream, nextStreamId, normalizeToStream } from "./utilities";

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

/**
 * Result of rendering a JSXNode - can be single node, multiple nodes, or null
 */
export type RenderResult = Node | readonly Node[] | null;

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
// Attribute/Property Handling
// ============================================================================

/**
 * Sets all props on an element (attributes, properties, styles)
 */
export function setElementProps(
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
export function handleStreamChild(
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
