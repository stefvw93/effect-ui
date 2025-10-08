import type { Effect, Stream } from "effect";
import type * as HTMLTypes from "html-jsx";

export const FRAGMENT = Symbol("liquidx/fragment");

export type JSXType = typeof FRAGMENT | string | ((props: object) => JSXNode);

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
	| { type: JSXType; props: object };

export type PropsWithChildren<T = object> = T & {
	children?: JSXNode | JSXNode[];
};

export function jsx(
	type: JSXType,
	props: PropsWithChildren<{ [key: string]: unknown }>,
): JSXNode {
	return { type, props };
}

export const jsxs: typeof jsx = jsx;

export function Fragment({ children }: { children?: JSXNode[] }): JSXNode {
	return jsx(FRAGMENT, { children });
}

// this declaration allows us to augment JSX interfaces
declare module "html-jsx" {
	// biome-ignore lint/correctness/noUnusedVariables: needed for jsx
	interface DOMAttributes<T> extends JSX.IntrinsicAttributes {
		children?: JSXNode | Stream.Stream<JSXNode> | Effect.Effect<JSXNode>;
	}
}

// this introduces our JSX definitions into the global scope
declare global {
	namespace JSX {
		type Element = JSXNode;

		// Map HTML attributes to support both static values and Streams
		type StreamCompatAttrs<T> = {
			[K in keyof T]?: T[K] | Stream.Stream<T[K]> | Effect.Effect<T[K]>;
		};

		// Apply the mapped type to all intrinsic elements
		type IntrinsicElements = {
			[K in keyof HTMLTypes.IntrinsicElements]: StreamCompatAttrs<
				HTMLTypes.IntrinsicElements[K]
			> & { [k: string]: unknown };
		};

		// here we can add attributes for all the elements
		interface IntrinsicAttributes {}

		interface HTMLAttributes<T>
			extends StreamCompatAttrs<HTMLTypes.HTMLAttributes<T>> {}
		interface SVGAttributes<T>
			extends StreamCompatAttrs<HTMLTypes.SVGAttributes<T>> {}
		interface DOMAttributes<T>
			extends StreamCompatAttrs<HTMLTypes.DOMAttributes<T>> {}
	}
}
