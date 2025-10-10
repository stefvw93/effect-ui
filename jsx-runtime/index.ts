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
	| Stream.Stream<JSXNode>
	| Effect.Effect<JSXNode>
	| { type: JSXType; props: object };

export type PropsWithChildren<T = object> = T & {
	children?: JSXNode | JSXNode[];
};

export function jsx(
	type: JSXType,
	props: PropsWithChildren<{ [key: string]: unknown }> | null,
	...children: JSXNode[]
): JSXNode {
	// Handle the classic JSX transform where children are passed as additional arguments
	const normalizedProps = props ?? {};

	// If children are passed as arguments (classic transform), add them to props
	if (children.length > 0) {
		return {
			type,
			props: {
				...normalizedProps,
				children: children.length === 1 ? children[0] : children
			}
		};
	}

	// Otherwise use children from props (automatic transform)
	return { type, props: normalizedProps };
}

export const jsxs: typeof jsx = jsx;

// Fragment needs to be the symbol directly for esbuild
export const Fragment = FRAGMENT;

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

		// Type for individual style properties that can be streams
		type StreamableStyleValue = string | number | Stream.Stream<string | number> | Effect.Effect<string | number>;

		// Style object with potentially streamable properties
		type StreamableStyleObject = {
			[key: string]: StreamableStyleValue | undefined;
		};

		// Complete style property type supporting all variations
		type StyleProp =
			| string // Style string: "color: red; font-size: 16px"
			| StreamableStyleObject // Object with potentially stream properties
			| Stream.Stream<string> // Stream of style strings
			| Stream.Stream<StreamableStyleObject> // Stream of style objects
			| Effect.Effect<string> // Effect of style string
			| Effect.Effect<StreamableStyleObject>; // Effect of style object

		// Map HTML attributes to support both static values and Streams
		type StreamCompatAttrs<T> = {
			[K in keyof T]?: K extends 'style'
				? StyleProp
				: T[K] | Stream.Stream<T[K]> | Effect.Effect<T[K]>;
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
			extends Omit<StreamCompatAttrs<HTMLTypes.HTMLAttributes<T>>, 'style'> {
			style?: StyleProp;
		}
		interface SVGAttributes<T>
			extends Omit<StreamCompatAttrs<HTMLTypes.SVGAttributes<T>>, 'style'> {
			style?: StyleProp;
		}
		interface DOMAttributes<T>
			extends StreamCompatAttrs<HTMLTypes.DOMAttributes<T>> {}
	}
}
