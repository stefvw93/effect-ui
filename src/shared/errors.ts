import { Data } from "effect";

/**
 * Error thrown when JSXNode has invalid type (not string, FRAGMENT, or function)
 */
export class InvalidElementType extends Data.TaggedError("InvalidElementType")<{
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
 * Error thrown during server-side rendering
 */
export class SSRRenderError extends Data.TaggedError("SSRRenderError")<{
	readonly cause: unknown;
	readonly message: string;
	readonly node?: unknown;
}> {}

/**
 * Error thrown when async component fails during SSR
 */
export class AsyncComponentError extends Data.TaggedError(
	"AsyncComponentError",
)<{
	readonly cause: unknown;
	readonly componentName: string;
	readonly props?: unknown;
}> {}
