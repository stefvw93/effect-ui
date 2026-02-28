import { Data } from "effect";

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
