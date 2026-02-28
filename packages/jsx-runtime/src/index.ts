import type {
	HTMLElements,
	JSXChild,
	JSXType,
	SVGElements,
} from "@effect-ui/html-types";

export { FRAGMENT, Fragment } from "@effect-ui/html-types";

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

declare global {
	namespace JSX {
		type Element = JSXChild;

		interface IntrinsicElements extends HTMLElements, SVGElements {}

		// interface IntrinsicAttributes {}
		// interface ElementChildrenAttribute {}
	}
}
