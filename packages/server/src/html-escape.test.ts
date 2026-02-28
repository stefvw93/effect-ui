import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	escapeAttribute,
	escapeHtml,
	toEscapedAttribute,
	toEscapedText,
} from "./html-escape";

describe("HTML escaping", () => {
	it("should escape HTML", () => {
		const input = '<script>alert("XSS")</script>';
		const expected = '&lt;script&gt;alert("XSS")&lt;/script&gt;';
		const result = escapeHtml(input);
		assert.equal(result, expected);
	});

	it("should escape attributes", () => {
		const input = 'Test "quoted" & <tagged>';
		const expected = "Test &quot;quoted&quot; &amp; &lt;tagged&gt;";
		const result = escapeAttribute(input);
		assert.equal(result, expected);
	});

	it("should convert to escaped text", () => {
		// Test with a string containing special characters
		assert.equal(
			toEscapedText('<div>Test & "quotes"</div>'),
			`&lt;div&gt;Test &amp; "quotes"&lt;/div&gt;`,
		);

		// Test with null, undefined, and boolean values
		assert.equal(toEscapedText(null), "");
		assert.equal(toEscapedText(undefined), "");
		assert.equal(toEscapedText(true), "");
		assert.equal(toEscapedText(false), "");
	});

	it("should convert to escaped attribute", () => {
		// Test with a string containing special characters
		assert.equal(
			toEscapedAttribute('Test "quoted" & <tagged>'),
			`Test &quot;quoted&quot; &amp; &lt;tagged&gt;`,
		);

		// Test with null, undefined, and boolean values
		assert.equal(toEscapedAttribute(null), "");
		assert.equal(toEscapedAttribute(undefined), "");
		assert.equal(toEscapedAttribute(true), "true");
		assert.equal(toEscapedAttribute(false), "false");
	});
});
