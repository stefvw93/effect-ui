import { Effect, Stream } from "effect";
import type { JSXNode, JSXType } from "@/jsx-runtime";
import { FRAGMENT } from "@/jsx-runtime";

/**
 * Result of rendering a JSXNode - can be single node, multiple nodes, or null.
 * Used by DOM renderer. SSR returns strings instead.
 */
export type DOMRenderResult = Node | readonly Node[] | null;

/**
 * Checks if a value is a JSX element (has type and props)
 */
export function isJSXElement(node: unknown): node is {
	type: JSXType;
	props: object;
} {
	return (
		node !== null &&
		typeof node === "object" &&
		"type" in node &&
		"props" in node
	);
}

/**
 * Checks if a value is a Fragment
 */
export function isFragment(type: unknown): type is typeof FRAGMENT {
	return type === FRAGMENT;
}

/**
 * Checks if a value is a function component
 */
export function isFunctionComponent(
	type: unknown,
): type is (props: object) => JSXNode {
	return typeof type === "function";
}

/**
 * Checks if a value is an HTML element name
 */
export function isHTMLElementType(type: unknown): type is string {
	return typeof type === "string";
}

/**
 * Checks if a value should be rendered as text
 */
export function isPrimitive(value: unknown): value is string | number | bigint {
	return (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "bigint"
	);
}

/**
 * Checks if a value should render nothing
 */
export function isNullish(
	value: unknown,
): value is null | undefined | boolean | void {
	return (
		value === null ||
		value === undefined ||
		typeof value === "boolean" ||
		value === void 0
	);
}

/**
 * Checks if a value is an iterable (but not string)
 */
export function isIterable(value: unknown): value is Iterable<unknown> {
	return (
		value !== null &&
		value !== undefined &&
		typeof value !== "string" &&
		typeof (value as any)[Symbol.iterator] === "function"
	);
}

/**
 * Checks if a value is a Stream
 */
export function isStream(value: unknown): value is Stream.Stream<unknown> {
	return (
		typeof value === "object" && value !== null && Stream.StreamTypeId in value
	);
}

/**
 * Checks if a value is an Effect
 */
export function isEffect(value: unknown): value is Effect.Effect<unknown> {
	return Effect.isEffect(value);
}

/**
 * Normalizes an Effect or Stream to a Stream
 */
export function normalizeToStream<T>(
	value: Effect.Effect<T> | Stream.Stream<T>,
): Stream.Stream<T> {
	if (Effect.isEffect(value)) {
		return Stream.fromEffect(value);
	}
	return value;
}

/**
 * List of HTML void elements (self-closing tags that should not have children)
 */
export const VOID_ELEMENTS = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
]);

/**
 * Checks if an element is a void element (self-closing)
 */
export function isVoidElement(tagName: string): boolean {
	return VOID_ELEMENTS.has(tagName.toLowerCase());
}

/**
 * Attribute name mappings from JSX to HTML
 */
export const ATTRIBUTE_MAPPINGS: Record<string, string> = {
	className: "class",
	htmlFor: "for",
};

/**
 * Gets the HTML attribute name for a JSX prop name
 */
export function getHTMLAttributeName(propName: string): string {
	return ATTRIBUTE_MAPPINGS[propName] || propName;
}

/**
 * Checks if a prop name is an event handler
 */
export function isEventHandler(propName: string): boolean {
	return (
		propName.startsWith("on") && propName[2] === propName[2]?.toUpperCase()
	);
}

/**
 * CSS properties that don't automatically get 'px' appended when numeric
 */
const CSS_UNITLESS_PROPERTIES = new Set([
	"animationIterationCount",
	"borderImageOutset",
	"borderImageSlice",
	"borderImageWidth",
	"boxFlex",
	"boxFlexGroup",
	"boxOrdinalGroup",
	"columnCount",
	"columns",
	"flex",
	"flexGrow",
	"flexPositive",
	"flexShrink",
	"flexNegative",
	"flexOrder",
	"gridArea",
	"gridRow",
	"gridRowEnd",
	"gridRowSpan",
	"gridRowStart",
	"gridColumn",
	"gridColumnEnd",
	"gridColumnSpan",
	"gridColumnStart",
	"fontWeight",
	"lineClamp",
	"lineHeight",
	"opacity",
	"order",
	"orphans",
	"tabSize",
	"widows",
	"zIndex",
	"zoom",
	// SVG properties
	"fillOpacity",
	"floodOpacity",
	"stopOpacity",
	"strokeDasharray",
	"strokeDashoffset",
	"strokeMiterlimit",
	"strokeOpacity",
	"strokeWidth",
]);

/**
 * Checks if a CSS property should have 'px' appended when numeric
 */
export function shouldAppendPx(propertyName: string): boolean {
	return !CSS_UNITLESS_PROPERTIES.has(propertyName);
}

/**
 * Converts a camelCase CSS property name to kebab-case
 */
export function camelToKebab(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Converts a style object to a CSS string
 */
export function styleObjectToString(style: Record<string, unknown>): string {
	const parts: string[] = [];

	for (const [key, value] of Object.entries(style)) {
		if (value === null || value === undefined) {
			continue;
		}

		const cssKey = key.startsWith("--") ? key : camelToKebab(key);
		let cssValue: string;

		if (typeof value === "number" && shouldAppendPx(key)) {
			cssValue = `${value}px`;
		} else {
			cssValue = String(value);
		}

		parts.push(`${cssKey}: ${cssValue}`);
	}

	return parts.join("; ");
}
