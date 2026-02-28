/**
 * HTML escaping utilities for safe server-side rendering
 */

// HTML escape maps for different contexts
const TEXT_ESCAPE_MAP: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
};

const ATTRIBUTE_ESCAPE_MAP: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

// Pre-compiled regex patterns for performance
const TEXT_ESCAPE_REGEX = /[&<>]/g;
const ATTRIBUTE_ESCAPE_REGEX = /[&<>"']/g;

/**
 * Escapes text content for safe HTML rendering.
 * Prevents XSS by escaping characters that could be interpreted as HTML.
 *
 * @param text - The text to escape
 * @returns The escaped text safe for HTML content
 *
 * @example
 * ```ts
 * escapeHtml('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert("XSS")&lt;/script&gt;'
 * ```
 */
export function escapeHtml(text: string): string {
	return text.replace(
		TEXT_ESCAPE_REGEX,
		(char) => TEXT_ESCAPE_MAP[char] || char,
	);
}

/**
 * Escapes attribute values for safe HTML rendering.
 * Includes additional escaping for quotes used in attributes.
 *
 * @param value - The attribute value to escape
 * @returns The escaped value safe for HTML attributes
 *
 * @example
 * ```ts
 * escapeAttribute('Test "quoted" & <tagged>')
 * // Returns: 'Test &quot;quoted&quot; &amp; &lt;tagged&gt;'
 * ```
 */
export function escapeAttribute(value: string): string {
	return value.replace(
		ATTRIBUTE_ESCAPE_REGEX,
		(char) => ATTRIBUTE_ESCAPE_MAP[char] || char,
	);
}

/**
 * Converts any value to a string and escapes it for HTML text content.
 * Handles null, undefined, and other primitives safely.
 *
 * @param value - The value to convert and escape
 * @returns The escaped HTML text or empty string for nullish values
 */
export function toEscapedText(value: unknown): string {
	if (value === null || value === undefined || typeof value === "boolean") {
		return "";
	}

	const text = String(value);
	return escapeHtml(text);
}

/**
 * Converts any value to a string and escapes it for HTML attributes.
 * Handles null and undefined by returning empty string.
 *
 * @param value - The value to convert and escape
 * @returns The escaped attribute value or empty string for nullish values
 */
export function toEscapedAttribute(value: unknown): string {
	if (value === null || value === undefined) {
		return "";
	}

	const text = String(value);
	return escapeAttribute(text);
}
