import { Effect, Stream } from "effect";
import { RenderContext } from "./dom";

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
