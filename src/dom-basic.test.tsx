import { describe, it, mock } from "node:test";
import * as assert from "node:assert/strict";
import { Effect, Stream } from "effect";
import { JSDOM } from "jsdom";
import { mount } from "./dom";

// ============================================================================
// Test Setup
// ============================================================================

/**
 * Creates a fresh DOM environment for each test
 */
function createTestDOM() {
	const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
	global.document = dom.window.document as unknown as Document;
	global.HTMLElement = dom.window.HTMLElement as unknown as typeof HTMLElement;
	global.Comment = dom.window.Comment as unknown as typeof Comment;
	global.Text = dom.window.Text as unknown as typeof Text;
	return dom;
}

/**
 * Creates a root element for mounting
 */
function createRoot(): HTMLElement {
	const root = document.createElement("div");
	root.id = "root";
	document.body.appendChild(root);
	return root;
}

/**
 * Helper to run mount and wait for initial render
 */
async function runMount(app: unknown, root: HTMLElement) {
	return await Effect.runPromise(mount(app as never, root));
}

// ============================================================================
// Basic Tests - Non-streaming functionality
// ============================================================================

describe("Basic DOM Rendering", () => {
	it("should render static text", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div>Hello World</div>, root);

		assert.equal(root.textContent, "Hello World");
	});

	it("should render nested elements", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<div>
				<span>Nested</span>
				<p>Content</p>
			</div>,
			root
		);

		assert.equal(root.children[0]?.children.length, 2);
		assert.equal(root.children[0]?.children[0]?.tagName, "SPAN");
		assert.equal(root.children[0]?.children[1]?.tagName, "P");
	});

	it("should set attributes correctly", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<div id="test" data-value="123">
				Content
			</div>,
			root
		);

		const div = root.children[0] as HTMLElement;
		assert.equal(div.id, "test");
		assert.equal(div.getAttribute("data-value"), "123");
	});

	it("should handle fragments", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<>
				<div>First</div>
				<div>Second</div>
			</>,
			root
		);

		assert.equal(root.children.length, 2);
		assert.equal(root.children[0]?.textContent, "First");
		assert.equal(root.children[1]?.textContent, "Second");
	});

	it("should handle function components", async () => {
		createTestDOM();
		const root = createRoot();

		function Component({ name }: { name: string }) {
			return <div>Hello {name}</div>;
		}

		await runMount(<Component name="Test" />, root);

		assert.equal(root.textContent, "Hello Test");
	});
});

describe("Effect Detection", () => {
	it("should correctly identify Effects", () => {
		const effect = Effect.succeed(42);
		const notEffect = { _op: "test" };
		const stream = Stream.make(1, 2, 3);

		assert.equal(Effect.isEffect(effect), true);
		assert.equal(Effect.isEffect(notEffect), false);
		assert.equal(Effect.isEffect(stream), false);
		assert.equal(Effect.isEffect(null), false);
		assert.equal(Effect.isEffect(undefined), false);
		assert.equal(Effect.isEffect("string"), false);
	});
});