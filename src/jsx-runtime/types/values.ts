import type * as CSS from "csstype";
import type { Effect, Stream } from "effect";
import type { FRAGMENT } from "@/jsx-runtime";

/**
 * Computes JSX context requirements from the augmented JSX.Requirements interface.
 * - When empty (not augmented): defaults to `any` to accept all streams/effects
 * - When augmented: union of all registered service types
 */
type JSXRequirements = keyof JSX.Requirements extends never
	? // biome-ignore lint/suspicious/noExplicitAny: intentionally permissive when not augmented
		any
	: JSX.Requirements[keyof JSX.Requirements];

export type AttributeValue<T> =
	| T
	| undefined
	| Stream.Stream<T | undefined, never, JSXRequirements>
	| Effect.Effect<T | undefined, never, JSXRequirements>;

export type StreamableStyleValue<T> =
	| T
	| Stream.Stream<string | number, never, JSXRequirements>
	| Effect.Effect<string | number, never, JSXRequirements>;

export type StreamableStyleObject = {
	[K in keyof CSS.Properties]?: AttributeValue<CSS.Properties[K]>;
};

export type StyleAttributeValue =
	| string // Style string: "color: red; font-size: 16px"
	| StreamableStyleObject // Object with potentially stream properties
	| Stream.Stream<string, never, JSXRequirements> // Stream of style strings
	| Stream.Stream<StreamableStyleObject, never, JSXRequirements> // Stream of style objects
	| Effect.Effect<string, never, JSXRequirements> // Effect of style string
	| Effect.Effect<StreamableStyleObject, never, JSXRequirements>; // Effect of style object

export type JSXChild =
	// biome-ignore lint/suspicious/noConfusingVoidType: convenient way to represent void nodes
	| void
	| null
	| undefined
	| string
	| number
	| bigint
	| boolean
	| Iterable<JSXChild>
	| Stream.Stream<JSXChild, never, JSXRequirements>
	| Effect.Effect<JSXChild, never, JSXRequirements>
	| { type: JSXType; props: Record<string, unknown> };

export type JSXType =
	| typeof FRAGMENT
	| string
	| ((props: Record<string, unknown>) => JSXChild);
