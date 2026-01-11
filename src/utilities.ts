import { Effect, Stream } from "effect";
import { RenderContext } from "./render-core";

/**
 * Generates next unique stream ID
 */
export function nextStreamId(): Effect.Effect<number, never, RenderContext> {
	return Effect.gen(function* () {
		const context = yield* RenderContext;
		return ++context.streamIdCounter.current;
	});
}

/**
 * Checks if value is a Stream
 */
export function isStream(value: unknown): value is Stream.Stream<unknown> {
	return (
		typeof value === "object" && value != null && Stream.StreamTypeId in value
	);
}

/**
 * Normalizes Effect/Stream to Stream
 */
export function normalizeToStream<A>(
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
