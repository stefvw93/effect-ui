import { describe, it } from "node:test";
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

/**
 * Helper to wait for stream emissions
 */
function waitFor(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Stream Tests - Isolated debugging
// ============================================================================

describe("Stream Debugging", () => {
	it("should handle Effect as child", async () => {
		createTestDOM();
		const root = createRoot();

		const effect = Effect.succeed("from effect");

		await runMount(<div>{effect}</div>, root);

		// Effects should be converted to streams
		// Wait for stream to emit
		await waitFor(150);

		console.log("After Effect mount:", root.innerHTML);
		assert.ok(root.textContent?.includes("from effect"), `Expected "from effect" but got "${root.textContent}"`);
	});

	it("should handle simple Stream as child", async () => {
		createTestDOM();
		const root = createRoot();

		// Create a simple stream with just one value
		const stream = Stream.make("stream value");

		await runMount(<div>{stream}</div>, root);

		// Wait for stream to emit
		await waitFor(150);

		console.log("After Stream mount:", root.innerHTML);
		assert.ok(root.textContent?.includes("stream value"), `Expected "stream value" but got "${root.textContent}"`);
	});

	it("should handle Stream with multiple values", async () => {
		createTestDOM();
		const root = createRoot();

		// Create a stream with multiple values
		const stream = Stream.make("first", "second");

		await runMount(<div>{stream}</div>, root);

		// Stream.make emits all values synchronously
		// Only the last value will be visible in the DOM
		await waitFor(100);
		console.log("After emission:", root.innerHTML);
		const content = root.textContent;
		assert.ok(content?.includes("second"), `Expected "second" but got "${content}"`);
		assert.ok(!content?.includes("first"), `Should not contain "first" but got "${content}"`);
	});

	it("should insert comment markers for streams", async () => {
		createTestDOM();
		const root = createRoot();

		const stream = Stream.make("content");

		await runMount(<div>{stream}</div>, root);

		// Check DOM structure
		const div = root.children[0];
		const nodes = Array.from(div?.childNodes ?? []);
		const comments = nodes.filter(n => n.nodeType === 8); // Comment nodes

		console.log("DOM nodes:", nodes.map(n => n.nodeType === 8 ? `Comment: ${n.textContent}` : `Node: ${n.textContent}`));

		assert.ok(comments.length >= 2, `Expected at least 2 comment markers but found ${comments.length}`);
	});

	it("should handle Stream.fromEffect", async () => {
		createTestDOM();
		const root = createRoot();

		const effect = Effect.succeed("effect value");
		const stream = Stream.fromEffect(effect);

		await runMount(<div>{stream}</div>, root);

		await waitFor(150);

		console.log("After Stream.fromEffect mount:", root.innerHTML);
		assert.ok(root.textContent?.includes("effect value"), `Expected "effect value" but got "${root.textContent}"`);
	});
});