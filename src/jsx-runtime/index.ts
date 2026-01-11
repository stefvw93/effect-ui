import type { HTMLElements } from "./types/html";
import type { SVGElements } from "./types/svg";
import type { JSXChild, JSXType } from "./types/values";

export const FRAGMENT = Symbol("effect-ui/jsx-runtime/fragment");

export function jsx(
	type: JSXType,
	props: { [key: string]: unknown; children?: JSXChild | JSXChild[] } | null,
	...children: JSXChild[]
): JSXChild {
	// Handle the classic JSX transform where children are passed as additional arguments
	const normalizedProps = props ?? {};

	// If children are passed as arguments (classic transform), add them to props
	if (children.length > 0) {
		return {
			type,
			props: {
				...normalizedProps,
				children: children.length === 1 ? children[0] : children,
			},
		};
	}

	// Otherwise use children from props (automatic transform)
	return { type, props: normalizedProps };
}

export const jsxs: typeof jsx = jsx;

export const Fragment = FRAGMENT;

declare global {
	namespace JSX {
		type Element = JSXChild;

		interface IntrinsicElements extends HTMLElements, SVGElements {}

		// interface IntrinsicAttributes {}
		// interface ElementChildrenAttribute {}
	}
}
