import { Effect, pipe, Stream } from "effect";
import type { JSXNode } from "@/jsx-runtime";

/**
 * Utilities for working with streams during server-side rendering
 */

/**
 * Awaits the first value from a stream with timeout support.
 * Returns undefined if the stream is empty or times out.
 *
 * @param stream - The stream to await
 * @param timeoutMs - Maximum time to wait in milliseconds
 * @returns An Effect that yields the first value or undefined
 */
export function awaitFirstValue<T>(
	stream: Stream.Stream<T>,
	timeoutMs = 5000,
): Effect.Effect<T | undefined> {
	return pipe(
		stream,
		Stream.runHead,
		Effect.timeout(timeoutMs),
		Effect.map((optionOrNone) => {
			// Check if we have None (timeout or empty stream)
			if (!optionOrNone || (optionOrNone as any)._tag === "None") {
				return undefined;
			}
			// Extract the Option value
			const option = (optionOrNone as any).value;
			if (!option || option._tag === "None") {
				return undefined;
			}
			return option.value as T;
		}),
		Effect.catchAll(() => Effect.succeed(undefined)),
	);
}

/**
 * Normalizes a JSXNode that might be an Effect or Stream to its resolved value.
 * Used during SSR to handle async components and stream children.
 *
 * @param node - The JSXNode to normalize
 * @param timeoutMs - Timeout for stream operations
 * @returns An Effect that yields the normalized JSXNode
 */
export function normalizeJSXNode(
	node: JSXNode,
	timeoutMs = 5000,
): Effect.Effect<JSXNode> {
	// Handle Effect nodes
	if (Effect.isEffect(node)) {
		return node as Effect.Effect<JSXNode>;
	}

	// Handle Stream nodes - await first value
	if (
		typeof node === "object" &&
		node !== null &&
		Stream.StreamTypeId in node
	) {
		return awaitFirstValue(node as Stream.Stream<JSXNode>, timeoutMs);
	}

	// Everything else is already normalized
	return Effect.succeed(node);
}

/**
 * Creates a stream that emits HTML chunks with proper backpressure handling.
 * This is the foundation for streaming SSR responses.
 *
 * @param generator - Function that yields HTML chunks
 * @returns A Stream that emits HTML string chunks
 */
export function createHTMLStream(
	generator: () => Generator<string, void, unknown>,
): Stream.Stream<string> {
	return Stream.fromIterable({
		[Symbol.iterator]: generator,
	});
}

/**
 * Combines multiple streams into a single concatenated stream.
 * Useful for combining header, body, and footer streams.
 *
 * @param streams - Array of streams to concatenate
 * @returns A single stream containing all chunks in order
 */
export function concatHTMLStreams(
	streams: Array<Stream.Stream<string>>,
): Stream.Stream<string> {
	return streams.reduce(
		(acc, stream) => Stream.concat(acc, stream),
		Stream.empty as Stream.Stream<string>,
	);
}
