import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { Effect, Stream, Schedule } from "effect";
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
 * Helper to wait for async operations
 */
function waitFor(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Correct Stream Behavior Tests
// ============================================================================

describe("Correct Stream Behavior", () => {
	it("Stream.make emits all values synchronously - only last is visible", async () => {
		createTestDOM();
		const root = createRoot();

		// Stream.make emits all values immediately
		const stream = Stream.make("first", "second", "third");

		await runMount(<div>{stream}</div>, root);

		// Give time for all sync emissions to process
		await waitFor(50);

		// Only the last value should be visible
		// because all updates happen synchronously
		assert.ok(root.textContent?.includes("third"));
		assert.ok(!root.textContent?.includes("first"));
		assert.ok(!root.textContent?.includes("second"));
	});

	it("Stream with delays between emissions shows different values", async () => {
		createTestDOM();
		const root = createRoot();

		// Create a stream that emits values with delays
		const stream = Stream.make("first").pipe(
			Stream.concat(
				Stream.make("second").pipe(
					Stream.schedule(Schedule.spaced(100))
				)
			),
			Stream.concat(
				Stream.make("third").pipe(
					Stream.schedule(Schedule.spaced(100))
				)
			)
		);

		await runMount(<div>{stream}</div>, root);

		// Initial value
		await waitFor(50);
		assert.ok(root.textContent?.includes("first"));

		// After first delay
		await waitFor(150);
		assert.ok(root.textContent?.includes("second"));

		// After second delay
		await waitFor(150);
		assert.ok(root.textContent?.includes("third"));
	});

	it("Effect.succeed converted to stream shows single value", async () => {
		createTestDOM();
		const root = createRoot();

		const effect = Effect.succeed("effect value");

		await runMount(<div>{effect}</div>, root);

		await waitFor(50);

		assert.ok(root.textContent?.includes("effect value"));
	});

	it("Multiple streams update independently", async () => {
		createTestDOM();
		const root = createRoot();

		const stream1 = Stream.make("A");
		const stream2 = Stream.make("B");

		await runMount(
			<div>
				{stream1}-{stream2}
			</div>,
			root
		);

		await waitFor(50);

		// Both streams should have their values
		assert.equal(root.textContent, "A-B");
	});

	it("Stream in attribute updates correctly", async () => {
		createTestDOM();
		const root = createRoot();

		// For attributes, only the last value matters with Stream.make
		const stream = Stream.make("val1", "val2", "val3");

		await runMount(<div data-test={stream}>content</div>, root);

		await waitFor(50);

		const div = root.children[0] as HTMLElement;
		// Only the last value should be set
		assert.equal(div.getAttribute("data-test"), "val3");
	});

	it("Stream with null/undefined removes attribute", async () => {
		createTestDOM();
		const root = createRoot();

		// Stream that ends with null - should remove the attribute
		const stream = Stream.make<string | null>("value", null);

		await runMount(<div data-test={stream}>content</div>, root);

		await waitFor(50);

		const div = root.children[0] as HTMLElement;
		// Attribute should be removed
		assert.equal(div.hasAttribute("data-test"), false);
	});
});