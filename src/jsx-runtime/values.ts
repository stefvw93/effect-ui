import type * as CSS from "csstype";
import type { Effect, Stream } from "effect";

export type AttributeValue<T> =
	| T
	| undefined
	| Stream.Stream<T | undefined>
	| Effect.Effect<T | undefined>;

export type StreamableStyleValue<T> =
	| T
	| Stream.Stream<string | number>
	| Effect.Effect<string | number>;

export type StreamableStyleObject = {
	[K in keyof CSS.Properties]?: AttributeValue<CSS.Properties[K]>;
};

export type StyleAttributeValue =
	| string // Style string: "color: red; font-size: 16px"
	| StreamableStyleObject // Object with potentially stream properties
	| Stream.Stream<string> // Stream of style strings
	| Stream.Stream<StreamableStyleObject> // Stream of style objects
	| Effect.Effect<string> // Effect of style string
	| Effect.Effect<StreamableStyleObject>; // Effect of style objectexport type JSXType = typeof FRAGMENT |

export type JSXNode =
	// biome-ignore lint/suspicious/noConfusingVoidType: convenient way to represent void nodes
	| void
	| null
	| undefined
	| string
	| number
	| bigint
	| boolean
	| Iterable<JSXNode>
	| Stream.Stream<JSXNode>
	| Effect.Effect<JSXNode>
	| { type: JSXType; props: Record<string, unknown> };
