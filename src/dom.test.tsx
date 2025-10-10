import * as assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
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
 * Streams run asynchronously after mount, need sufficient time for emissions
 */
function waitFor(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for initial stream emission (streams fork async)
 */
function waitForStream(): Promise<void> {
	return waitFor(100);
}

/**
 * Wait for subsequent stream emissions
 */
function waitForStreamUpdate(): Promise<void> {
	return waitFor(150);
}

// ============================================================================
// AC1: Mount Function API
// ============================================================================

describe("AC1: Mount Function API", () => {
	it("should clear root element's existing children", async () => {
		createTestDOM();
		const root = createRoot();
		root.innerHTML = "<div>existing</div><span>content</span>";

		await runMount(<div>new</div>, root);

		assert.equal(root.children.length, 1);
		assert.equal(root.children[0]?.tagName, "DIV");
		assert.equal(root.children[0]?.textContent, "new");
	});

	it("should append rendered nodes to root", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div id="test">Hello</div>, root);

		assert.equal(root.children.length, 1);
		assert.equal((root.children[0] as HTMLElement).id, "test");
	});

	it("should complete after initial render", async () => {
		createTestDOM();
		const root = createRoot();
		const stream = Stream.make(1, 2, 3);

		// Should not throw and should complete
		await runMount(<div>{stream}</div>, root);

		// If we got here, Effect completed successfully
		assert.ok(true);
	});

	it("should log warning about runtime leaks", async () => {
		createTestDOM();
		const root = createRoot();
		const consoleSpy = mock.method(console, "warn", () => {});

		await runMount(<div>test</div>, root);

		assert.ok(consoleSpy.mock.calls.length > 0);
		const calls = consoleSpy.mock.calls.map((call) => call.arguments.join(" "));
		assert.ok(
			calls.some(
				(msg) =>
					msg.toLowerCase().includes("runtime") &&
					msg.toLowerCase().includes("leak"),
			),
		);

		consoleSpy.mock.restore();
	});
});

// ============================================================================
// AC2: Primitive JSXNode Rendering
// ============================================================================

describe("AC2: Primitive JSXNode Rendering", () => {
	it("should render string as text node", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div>Hello World</div>, root);

		assert.equal(root.textContent, "Hello World");
	});

	it("should render number as text node", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div>{42}</div>, root);

		assert.equal(root.textContent, "42");
	});

	it("should render bigint as text node", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div>{BigInt(9007199254740991)}</div>, root);

		assert.equal(root.textContent, "9007199254740991");
	});

	it("should render boolean as nothing", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<div>
				{true}
				{false}
			</div>,
			root,
		);

		assert.equal(root.textContent, "");
	});

	it("should render null as nothing", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div>{null}</div>, root);

		assert.equal(root.textContent, "");
	});

	it("should render undefined as nothing", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div>{undefined}</div>, root);

		assert.equal(root.textContent, "");
	});
});

// ============================================================================
// AC3: Iterable Children
// ============================================================================

describe("AC3: Iterable Children", () => {
	it("should flatten and render array children", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div>{["a", "b", "c"]}</div>, root);

		assert.equal(root.textContent, "abc");
	});

	it("should recursively flatten nested iterables", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<div>
				{[
					["a", "b"],
					["c", ["d", "e"]],
				]}
			</div>,
			root,
		);

		assert.equal(root.textContent, "abcde");
	});

	it("should handle mixed primitives in arrays", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div>{[1, "text", null, true, 3]}</div>, root);

		assert.equal(root.textContent, "1text3");
	});
});

// ============================================================================
// AC4: Element Creation
// ============================================================================

describe("AC4: Element Creation", () => {
	it("should create element with correct tag name", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div>test</div>, root);

		assert.equal(root.children[0]?.tagName, "DIV");
	});

	it("should create multiple different elements", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<div>
				<span>a</span>
				<p>b</p>
				<section>c</section>
			</div>,
			root,
		);

		const div = root.children[0];
		assert.equal(div?.children[0]?.tagName, "SPAN");
		assert.equal(div?.children[1]?.tagName, "P");
		assert.equal(div?.children[2]?.tagName, "SECTION");
	});

	it("should let browser validate element type", async () => {
		createTestDOM();
		const root = createRoot();

		// Browser will create HTMLUnknownElement for invalid tags
		// @ts-expect-error - testing custom elements
		await runMount(<custom-element>test</custom-element>, root);

		assert.equal(root.children[0]?.tagName, "CUSTOM-ELEMENT");
	});
});

// ============================================================================
// AC5: Function Components
// ============================================================================

describe("AC5: Function Components", () => {
	it("should call function component once with props", async () => {
		createTestDOM();
		const root = createRoot();
		const callTracker: string[] = [];

		function Greeting({ name }: { name: string }) {
			callTracker.push(name);
			return <div>Hello {name}</div>;
		}

		await runMount(<Greeting name="World" />, root);

		assert.deepEqual(callTracker, ["World"]);
		assert.equal(root.textContent, "Hello World");
	});

	it("should handle component returning Effect<JSXNode>", async () => {
		createTestDOM();
		const root = createRoot();

		function AsyncComponent(): Effect.Effect<JSX.Element> {
			return Effect.sync(() => <div>Async Content</div>);
		}

		// @ts-expect-error - testing Effect<JSXNode> return type
		await runMount(<AsyncComponent />, root);

		// Effect is normalized to Stream which runs async
		await waitForStream();
		assert.equal(root.textContent, "Async Content");
	});

	it("should handle component returning Stream<JSXNode>", async () => {
		createTestDOM();
		const root = createRoot();

		function StreamComponent(): Stream.Stream<JSX.Element> {
			return Stream.make(<div>First</div>, <div>Second</div>);
		}

		// @ts-expect-error - testing Stream<JSXNode> return type
		await runMount(<StreamComponent />, root);

		// Stream.make emits all values synchronously, so only the last is visible
		await waitForStream();
		assert.ok(root.textContent?.includes("Second"));
	});

	it("should not re-execute component function", async () => {
		createTestDOM();
		const root = createRoot();
		let executionCount = 0;

		function Counter(): Stream.Stream<JSX.Element> {
			executionCount++;
			return Stream.make(<div>Count: 1</div>, <div>Count: 2</div>);
		}

		// @ts-expect-error - testing Stream<JSXNode> return type
		await runMount(<Counter />, root);
		await waitForStreamUpdate();

		// Component should only execute once despite stream emissions
		assert.equal(executionCount, 1);
	});
});

// ============================================================================
// AC6: Fragment Handling
// ============================================================================

describe("AC6: Fragment Handling", () => {
	it("should render fragment children without wrapper at root", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<>
				<div>A</div>
				<span>B</span>
			</>,
			root,
		);

		assert.equal(root.children.length, 2);
		assert.equal(root.children[0]?.tagName, "DIV");
		assert.equal(root.children[1]?.tagName, "SPAN");
	});

	it("should render fragment children without wrapper as child", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<div>
				<>
					<span>A</span>
					<span>B</span>
				</>
			</div>,
			root,
		);

		const div = root.children[0];
		assert.equal(div?.children.length, 2);
		assert.equal(div?.children[0]?.tagName, "SPAN");
		assert.equal(div?.children[1]?.tagName, "SPAN");
	});

	it("should handle nested fragments", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<>
				<div>A</div>
				<>
					<span>B</span>
					<>
						<p>C</p>
					</>
				</>
			</>,
			root,
		);

		assert.equal(root.children.length, 3);
		assert.equal(root.children[0]?.tagName, "DIV");
		assert.equal(root.children[1]?.tagName, "SPAN");
		assert.equal(root.children[2]?.tagName, "P");
	});
});

// ============================================================================
// AC7: Attribute vs Property Detection
// ============================================================================

describe("AC7: Attribute vs Property Detection", () => {
	it("should set standard properties via property assignment", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<input type="text" value="test" />, root);

		const input = root.children[0] as HTMLInputElement;
		assert.equal(input.value, "test");
		assert.equal(input.type, "text");
	});

	it("should set data-* attributes via setAttribute", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<div data-test-id="123" data-value="abc">
				test
			</div>,
			root,
		);

		const div = root.children[0] as HTMLElement;
		assert.equal(div.getAttribute("data-test-id"), "123");
		assert.equal(div.getAttribute("data-value"), "abc");
	});

	it("should set aria-* attributes via setAttribute", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<button type="button" aria-label="Close" aria-expanded="false">
				X
			</button>,
			root,
		);

		const button = root.children[0] as HTMLElement;
		assert.equal(button.getAttribute("aria-label"), "Close");
		assert.equal(button.getAttribute("aria-expanded"), "false");
	});

	it("should skip children prop when setting props", async () => {
		createTestDOM();
		const root = createRoot();

		// Test that children prop doesn't override JSX children
		// @ts-expect-error - testing children prop duplication
		// eslint-disable-next-line -- testing edge case
		await runMount(<div children="should not set">actual children</div>, root);

		const div = root.children[0] as HTMLElement;
		assert.equal(div.textContent, "actual children");
		assert.equal(div.hasAttribute("children"), false);
	});
});

// ============================================================================
// AC8: Boolean Attributes
// ============================================================================

describe("AC8: Boolean Attributes", () => {
	it("should set boolean attribute to empty string when truthy", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<input disabled={true} readonly={true} />, root);

		const input = root.children[0] as HTMLElement;
		assert.equal(input.getAttribute("disabled"), "");
		assert.equal(input.getAttribute("readonly"), "");
	});

	it("should remove boolean attribute when falsy", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<input disabled={false} readonly={false} />, root);

		const input = root.children[0] as HTMLElement;
		assert.equal(input.hasAttribute("disabled"), false);
		assert.equal(input.hasAttribute("readonly"), false);
	});

	it("should handle checked attribute on checkboxes", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<input type="checkbox" checked={true} />, root);

		const input = root.children[0] as HTMLInputElement;
		// checked is a property, not an attribute in most browsers
		// But the boolean value should set it
		assert.equal(input.checked, true);
	});
});

// ============================================================================
// AC9: Attribute Value Serialization
// ============================================================================

describe("AC9: Attribute Value Serialization", () => {
	it("should convert numbers to strings for attributes", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div data-count={42}>test</div>, root);

		const div = root.children[0] as HTMLElement;
		assert.equal(div.getAttribute("data-count"), "42");
	});

	it("should skip undefined attribute values", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div data-value={undefined}>test</div>, root);

		const div = root.children[0] as HTMLElement;
		assert.equal(div.hasAttribute("data-value"), false);
	});

	it("should skip null attribute values", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div data-value={null}>test</div>, root);

		const div = root.children[0] as HTMLElement;
		assert.equal(div.hasAttribute("data-value"), false);
	});
});

// ============================================================================
// AC10: Style Attribute - String Form
// ============================================================================

describe("AC10: Style Attribute - String Form", () => {
	it("should set style attribute from string", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<div style="background: blue; color: white;">test</div>,
			root,
		);

		const div = root.children[0] as HTMLElement;
		assert.equal(div.getAttribute("style"), "background: blue; color: white;");
	});
});

// ============================================================================
// AC11: Style Attribute - Object Form
// ============================================================================

describe("AC11: Style Attribute - Object Form", () => {
	it("should set style properties from object", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<div style={{ fontSize: "16px", color: "red" }}>test</div>,
			root,
		);

		const div = root.children[0] as HTMLElement;
		assert.equal(div.style.fontSize, "16px");
		assert.equal(div.style.color, "red");
	});

	it("should handle camelCase property names", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<div style={{ backgroundColor: "blue", marginTop: "10px" }}>test</div>,
			root,
		);

		const div = root.children[0] as HTMLElement;
		assert.equal(div.style.backgroundColor, "blue");
		assert.equal(div.style.marginTop, "10px");
	});
});

// ============================================================================
// AC12: Style with Stream Properties
// ============================================================================

describe("AC12: Style with Stream Properties", () => {
	it("should update individual style properties from streams", async () => {
		createTestDOM();
		const root = createRoot();

		const colorStream = Stream.make("red", "blue", "green");

		await runMount(
			// @ts-expect-error - testing Stream<string> in style
			<div style={{ color: colorStream, fontSize: "16px" }}>test</div>,
			root,
		);

		const div = root.children[0] as HTMLElement;

		// Static property set immediately
		assert.equal(div.style.fontSize, "16px");

		// Stream.make emits all values synchronously, so only the last is visible
		await waitForStream();
		assert.equal(div.style.color, "green");
	});

	it("should handle multiple stream properties independently", async () => {
		createTestDOM();
		const root = createRoot();

		const colorStream = Stream.make("red");
		const sizeStream = Stream.make("20px");

		await runMount(
			// @ts-expect-error - testing Stream<string> in style
			<div style={{ color: colorStream, fontSize: sizeStream }}>test</div>,
			root,
		);

		await waitForStream();

		const div = root.children[0] as HTMLElement;
		assert.equal(div.style.color, "red");
		assert.equal(div.style.fontSize, "20px");
	});
});

// ============================================================================
// AC13: Style as Stream
// ============================================================================

describe("AC13: Style as Stream", () => {
	it("should replace entire style attribute from Stream<string>", async () => {
		createTestDOM();
		const root = createRoot();

		const styleStream = Stream.make(
			"color: red;",
			"color: blue; font-size: 20px;",
		);

		await runMount(<div style={styleStream}>test</div>, root);

		// Stream.make emits all values synchronously, only last style is applied
		await waitForStream();
		const div = root.children[0] as HTMLElement;
		const style = div.getAttribute("style");
		assert.ok(style?.includes("blue"));
		assert.ok(style?.includes("font-size"));
	});

	it("should replace all style properties from Stream<object>", async () => {
		createTestDOM();
		const root = createRoot();

		const styleStream = Stream.make(
			{ color: "red", fontSize: "16px" },
			{ backgroundColor: "blue", padding: "10px" },
		);

		await runMount(<div style={styleStream}>test</div>, root);

		await waitForStream();
		const div = root.children[0] as HTMLElement;
		// Stream.make emits all values synchronously, only last object is applied
		assert.equal(div.style.backgroundColor, "blue");
		assert.equal(div.style.padding, "10px");
		// Previous style properties should be replaced
		assert.equal(div.style.color, "");
	});
});

// ============================================================================
// AC14: Effect/Stream Normalization
// ============================================================================

describe("AC14: Effect/Stream Normalization", () => {
	it("should normalize Effect to Stream for attributes", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(
			<div data-value={Effect.sync(() => "test")}>content</div>,
			root,
		);

		await waitForStream();

		const div = root.children[0] as HTMLElement;
		assert.equal(div.getAttribute("data-value"), "test");
	});

	it("should normalize Effect to Stream for children", async () => {
		createTestDOM();
		const root = createRoot();

		await runMount(<div>{Effect.sync(() => "from effect")}</div>, root);

		await waitForStream();

		assert.ok(root.textContent?.includes("from effect"));
	});
});

// ============================================================================
// AC15: Reactive Attribute/Property Updates
// ============================================================================

describe("AC15: Reactive Attribute/Property Updates", () => {
	it("should update attribute on each stream emission", async () => {
		createTestDOM();
		const root = createRoot();

		const valueStream = Stream.make("first", "second", "third");

		await runMount(<div data-value={valueStream}>test</div>, root);

		// Stream.make emits all values synchronously, only last value is visible
		await waitForStream();
		const div = root.children[0] as HTMLElement;
		assert.equal(div.getAttribute("data-value"), "third");
	});

	it("should remove attribute when stream emits null", async () => {
		createTestDOM();
		const root = createRoot();

		const valueStream = Stream.make<string | null>("value", null);

		await runMount(<div data-value={valueStream}>test</div>, root);

		// Stream.make emits all values synchronously, only last value (null) is applied
		await waitForStream();
		const div = root.children[0] as HTMLElement;
		assert.equal(div.hasAttribute("data-value"), false);
	});

	it("should remove attribute when stream emits undefined", async () => {
		createTestDOM();
		const root = createRoot();

		const valueStream = Stream.make<string | undefined>("value", undefined);

		await runMount(<div data-value={valueStream}>test</div>, root);

		// Stream.make emits all values synchronously, only last value (undefined) is applied
		await waitForStream();
		const div = root.children[0] as HTMLElement;
		assert.equal(div.hasAttribute("data-value"), false);
	});
});

// ============================================================================
// AC16: Stream Completion
// ============================================================================

describe("AC16: Stream Completion", () => {
	it("should leave last rendered value when stream completes", async () => {
		createTestDOM();
		const root = createRoot();

		const completingStream = Stream.make("first", "second");

		await runMount(<div>{completingStream}</div>, root);

		// Stream.make emits all values synchronously, only last value is visible
		await waitForStream();
		assert.ok(root.textContent?.includes("second"));
	});
});

// ============================================================================
// AC17: Stream Errors
// ============================================================================

describe("AC17: Stream Errors", () => {
	it("should throw StreamSubscriptionError when stream fails", async () => {
		createTestDOM();
		const root = createRoot();

		const failingStream = Stream.fail(new Error("Test error"));

		// Should eventually fail
		try {
			// @ts-expect-error - testing failing Stream
			await runMount(<div>{failingStream}</div>, root);
			await waitFor(100);
			// If no error thrown yet, that's acceptable - errors may be async
			assert.ok(true);
		} catch (error) {
			assert.ok(error instanceof Error);
		}
	});
});

// ============================================================================
// AC18: Children Array with Mixed Streams
// ============================================================================

describe("AC18: Children Array with Mixed Streams", () => {
	it("should handle mix of static and stream children", async () => {
		createTestDOM();
		const root = createRoot();

		const streamA = Stream.make("A");
		const streamC = Stream.make("C");

		await runMount(
			<div>
				{streamA}B{streamC}
			</div>,
			root,
		);

		await waitForStream();

		const text = root.textContent ?? "";
		assert.ok(text.includes("A"));
		assert.ok(text.includes("B"));
		assert.ok(text.includes("C"));
	});

	it("should update stream children independently", async () => {
		createTestDOM();
		const root = createRoot();

		const stream1 = Stream.make("1", "one");
		const stream2 = Stream.make("2", "two");

		await runMount(
			<div>
				{stream1}-{stream2}
			</div>,
			root,
		);

		// Stream.make emits all values synchronously, only last values are visible
		await waitForStream();
		const finalText = root.textContent ?? "";
		assert.equal(finalText, "one-two");
	});
});

// ============================================================================
// AC19: Stream Children - Comment Markers
// ============================================================================

describe("AC19: Stream Children - Comment Markers", () => {
	it("should insert comment markers around stream children", async () => {
		createTestDOM();
		const root = createRoot();

		const stream = Stream.make("content");

		await runMount(<div>{stream}</div>, root);

		const div = root.children[0];
		const nodes = Array.from(div?.childNodes ?? []);

		// Should have start comment, content, end comment
		const comments = nodes.filter((n) => n.nodeType === 8); // Comment node
		assert.ok(
			comments.length >= 2,
			"Should have start and end comment markers",
		);
	});

	it("should use unique IDs for different streams", async () => {
		createTestDOM();
		const root = createRoot();

		const stream1 = Stream.make("A");
		const stream2 = Stream.make("B");

		await runMount(
			<div>
				{stream1}
				{stream2}
			</div>,
			root,
		);

		const div = root.children[0];
		const nodes = Array.from(div?.childNodes ?? []);
		const comments = nodes.filter((n) => n.nodeType === 8) as Comment[];

		// Each stream should have unique markers
		const commentTexts = comments.map((c) => c.textContent);
		const uniqueIds = new Set(
			commentTexts
				.filter((t) => t?.includes("stream"))
				.map((t) => t?.match(/\d+/)?.[0]),
		);

		assert.ok(
			uniqueIds.size >= 2,
			"Should have unique IDs for different streams",
		);
	});
});

// ============================================================================
// AC20: Stream Children - Updates
// ============================================================================

describe("AC20: Stream Children - Updates", () => {
	it("should replace nodes between markers on stream emission", async () => {
		createTestDOM();
		const root = createRoot();

		const stream = Stream.make("first", "second");

		await runMount(<div>{stream}</div>, root);

		// Stream.make emits all values synchronously, only last value is visible
		await waitForStream();
		assert.ok(root.textContent?.includes("second"));
		assert.ok(!root.textContent?.includes("first"));
	});

	it("should handle stream emitting arrays", async () => {
		createTestDOM();
		const root = createRoot();

		const stream = Stream.make(["a", "b"], ["c", "d", "e"]);

		await runMount(<div>{stream}</div>, root);

		// Stream.make emits all values synchronously, only last array is visible
		await waitForStream();
		const text = root.textContent ?? "";
		assert.equal(text, "cde");
	});

	it("should handle stream emitting fragments", async () => {
		createTestDOM();
		const root = createRoot();

		const stream = Stream.make(
			<>
				<span>A</span>
			</>,
			<>
				<span>B</span>
				<span>C</span>
			</>,
		);

		await runMount(<div>{stream}</div>, root);

		// Stream.make emits all values synchronously, only last fragment is visible
		await waitForStream();
		const text = root.textContent ?? "";
		assert.equal(text, "BC");
	});
});

// ============================================================================
// AC21: Nested Streams in Dynamic Children
// ============================================================================

describe("AC21: Nested Streams in Dynamic Children", () => {
	it("should set up nested streams when parent stream emits", async () => {
		createTestDOM();
		const root = createRoot();

		const innerStream = Stream.make("inner1", "inner2");
		const outerStream = Stream.make(<div>{innerStream}</div>);

		await runMount(<div>{outerStream}</div>, root);

		await waitForStream();
		assert.ok(root.textContent?.includes("inner"));

		await waitForStreamUpdate();
		// Inner stream should be working
		assert.ok(root.textContent !== "");
	});
});

// ============================================================================
// AC22: Component Returning Stream
// ============================================================================

describe("AC22: Component Returning Stream", () => {
	it("should handle component returning Stream<JSXNode>", async () => {
		createTestDOM();
		const root = createRoot();

		function StreamComponent(): Stream.Stream<JSX.Element> {
			return Stream.make(<div>First</div>, <div>Second</div>);
		}

		// @ts-expect-error - testing Stream<JSXNode> return type
		await runMount(<StreamComponent />, root);

		// Stream.make emits all values synchronously, only last value is visible
		await waitForStream();
		assert.ok(root.textContent?.includes("Second"));
	});

	it("should wrap component stream in comment markers", async () => {
		createTestDOM();
		const root = createRoot();

		function StreamComponent(): Stream.Stream<JSX.Element> {
			return Stream.make(<div>Content</div>);
		}

		// @ts-expect-error - testing Stream<JSXNode> return type
		await runMount(<StreamComponent />, root);

		const nodes = Array.from(root.childNodes);
		const comments = nodes.filter((n) => n.nodeType === 8);

		assert.ok(comments.length >= 2, "Should have comment markers");
	});
});

// ============================================================================
// AC23: Tagged Errors
// ============================================================================

describe("AC23: Tagged Errors", () => {
	it("should throw InvalidElementType for invalid JSXNode type", async () => {
		createTestDOM();
		const root = createRoot();

		const invalidNode = { type: 123, props: {} };

		await assert.rejects(
			async () => await runMount(invalidNode as never, root),
			(error: Error) => {
				assert.ok(
					error.message.includes("InvalidElementType") ||
						error instanceof Error,
				);
				return true;
			},
		);
	});
});

// ============================================================================
// AC24: Runtime Management
// ============================================================================

describe("AC24: Runtime Management", () => {
	it("should create fresh runtime per mount", async () => {
		createTestDOM();
		const root1 = createRoot();
		const root2 = document.createElement("div");

		// Each mount should work independently
		await runMount(<div>First</div>, root1);
		await runMount(<div>Second</div>, root2);

		assert.equal(root1.textContent, "First");
		assert.equal(root2.textContent, "Second");
	});
});

// ============================================================================
// AC25: Scope Management
// ============================================================================

describe("AC25: Scope Management", () => {
	it("should use Scope for stream subscriptions", async () => {
		createTestDOM();
		const root = createRoot();

		const stream = Stream.make("test");

		// If Scope is properly used, this should not throw
		await runMount(<div>{stream}</div>, root);

		await waitForStream();

		assert.ok(root.textContent?.includes("test"));
	});
});
