import { Effect, Stream } from "effect";
import { RenderContext } from "./render-core";
import type { StreamSubscriptionError } from "./types";
import { isStream, normalizeToStream } from "./utilities";

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
