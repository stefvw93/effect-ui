import {
	Context,
	Effect,
	type ManagedRuntime,
	type Scope,
	type Stream,
} from "effect";
import {
	handleStreamChild,
	InvalidElementTypeError,
	type RenderError,
	type StreamSubscriptionError,
	setElementProps,
} from "./dom";
import { FRAGMENT, type JSXNode } from "./jsx-runtime";
import { isStream, normalizeToStream } from "./utilities";

/**
 * Main rendering function that converts JSXNode to DOM nodes.
 * Handles all JSXNode types and sets up reactive subscriptions.
 */
export function renderNode(
	node: JSXNode,
): Effect.Effect<
	RenderResult,
	InvalidElementTypeError | StreamSubscriptionError | RenderError,
	RenderContext
> {
	return Effect.gen(function* () {
		// AC2: Handle primitives
		if (
			typeof node === "string" ||
			typeof node === "number" ||
			typeof node === "bigint"
		) {
			return document.createTextNode(String(node));
		}

		// AC2: Boolean, null, undefined, void -> render nothing
		if (typeof node === "boolean" || node === null || node === undefined) {
			return null;
		}

		// Check for Stream/Effect first (before iterables, since Stream might be iterable)
		if (isStream(node) || Effect.isEffect(node)) {
			// Streams/Effects as direct children need to be wrapped in markers
			const stream = normalizeToStream(node);
			const fragment = document.createDocumentFragment();
			const markers = yield* handleStreamChild(stream, fragment);
			return markers;
		}

		// AC3: Handle iterables (including arrays)
		if (
			typeof node === "object" &&
			Symbol.iterator in node &&
			!("type" in node)
		) {
			const flattened = flattenChildren(node);
			return yield* renderChildren(flattened);
		}

		// Handle JSX elements: { type, props }
		if (
			typeof node === "object" &&
			"type" in node &&
			!(Symbol.iterator in node)
		) {
			const element = node as { type: unknown; props: object };
			const { type, props } = element;

			// AC6: Fragment
			if (type === FRAGMENT) {
				return yield* renderFragment(props);
			}

			// AC4: Element (string type)
			if (typeof type === "string") {
				return yield* renderElement(type, props);
			}

			// AC5: Function component
			if (typeof type === "function") {
				return yield* renderComponent(
					type as (props: object) => JSXNode,
					props,
				);
			}

			// AC23: Invalid element type
			return yield* Effect.fail(
				new InvalidElementTypeError({
					type,
					message: `Invalid JSXNode type: expected string, FRAGMENT, or function, got ${typeof type}`,
				}),
			);
		}

		// Shouldn't reach here, but handle gracefully
		return null;
	});
}

/**
 * Flattens iterable children recursively
 */
export function flattenChildren(node: JSXNode): readonly JSXNode[] {
	const result: JSXNode[] = [];

	function flatten(item: JSXNode): void {
		// Don't try to iterate streams/effects
		if (isStream(item) || Effect.isEffect(item)) {
			result.push(item);
			return;
		}

		if (
			typeof item === "object" &&
			item !== null &&
			Symbol.iterator in item &&
			!("type" in item)
		) {
			for (const child of item as Iterable<JSXNode>) {
				flatten(child);
			}
		} else {
			result.push(item);
		}
	}

	flatten(node);
	return result;
}

/**
 * Renders an array of children nodes
 */
export function renderChildren(
	children: readonly JSXNode[],
): Effect.Effect<
	readonly Node[],
	InvalidElementTypeError | StreamSubscriptionError | RenderError,
	RenderContext
> {
	return Effect.gen(function* () {
		const nodes: Node[] = [];

		for (const child of children) {
			// Check if child is a stream/effect and handle specially
			if (isStream(child) || Effect.isEffect(child)) {
				const stream = normalizeToStream(child) as Stream.Stream<JSXNode>;
				const fragment = document.createDocumentFragment();
				const markers = yield* handleStreamChild(stream, fragment);
				nodes.push(...markers);
			} else {
				const result = yield* renderNode(child);

				if (result !== null) {
					if (Array.isArray(result)) {
						nodes.push(...result);
					} else {
						nodes.push(result as Node);
					}
				}
			}
		}

		return nodes;
	});
}

/**
 * Renders a fragment JSXNode (type: FRAGMENT)
 */
export function renderFragment(
	props: object,
): Effect.Effect<
	readonly Node[],
	InvalidElementTypeError | StreamSubscriptionError | RenderError,
	RenderContext
> {
	return Effect.gen(function* () {
		const children = "children" in props ? props.children : undefined;

		if (children === undefined) {
			return [];
		}

		const childArray = Array.isArray(children) ? children : [children];
		return yield* renderChildren(childArray);
	});
}

/**
 * Renders an element JSXNode (type: string)
 */
export function renderElement(
	type: string,
	props: object,
): Effect.Effect<
	HTMLElement,
	InvalidElementTypeError | StreamSubscriptionError | RenderError,
	RenderContext
> {
	return Effect.gen(function* () {
		// AC4: Create element using document.createElement
		const element = document.createElement(type);

		// AC4: Set attributes/props first
		yield* setElementProps(element, props);

		// AC4: Then append children
		const children = "children" in props ? props.children : undefined;

		if (children !== undefined) {
			const childArray = Array.isArray(children) ? children : [children];

			for (const child of childArray) {
				// Check if child is a stream/effect
				if (isStream(child) || Effect.isEffect(child)) {
					const stream = normalizeToStream(child) as Stream.Stream<JSXNode>;
					const markers = yield* handleStreamChild(stream, element);
					for (const marker of markers) {
						element.appendChild(marker);
					}
				} else {
					const result = yield* renderNode(child);
					if (result !== null) {
						if (Array.isArray(result)) {
							for (const node of result) {
								element.appendChild(node);
							}
						} else {
							element.appendChild(result as Node);
						}
					}
				}
			}
		}

		return element;
	});
}

/**
 * Renders a function component JSXNode (type: function)
 */
export function renderComponent(
	component: (props: object) => JSXNode,
	props: object,
): Effect.Effect<
	RenderResult,
	InvalidElementTypeError | StreamSubscriptionError | RenderError,
	RenderContext
> {
	return Effect.gen(function* () {
		// AC5: Call function once with props (ephemeral execution)
		const result = component(props);

		// AC5: Handle Effect<JSXNode> or Stream<JSXNode>
		if (isStream(result) || Effect.isEffect(result)) {
			const stream = normalizeToStream(result);

			// AC22: Component returning stream treated as stream child
			// Create a temporary container to hold markers
			const fragment = document.createDocumentFragment();
			const markers = yield* handleStreamChild(stream, fragment);

			// Return all markers as array
			return markers;
		}

		// AC5: Plain JSXNode
		return yield* renderNode(result);
	});
}

/**
 * Service for managing rendering context including runtime, scope, and stream IDs
 */
export class RenderContext extends Context.Tag("RenderContext")<
	RenderContext,
	{
		readonly runtime: ManagedRuntime.ManagedRuntime<never, never>;
		readonly scope: Scope.Scope;
		readonly streamIdCounter: { current: number };
	}
>() {}
/**
 * Result of rendering a JSXNode - can be single node, multiple nodes, or null
 */

export type RenderResult = Node | readonly Node[] | null;
