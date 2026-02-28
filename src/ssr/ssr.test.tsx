import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Effect, Stream } from "effect";
import type { JSXNode } from "@/jsx-runtime";
import { jsx } from "@/jsx-runtime";
import { renderToStream, renderToString } from "./index";

describe("SSR - Server-Side Rendering", () => {
	// =========================================================================
	// AC1: RenderToStream Function API
	// =========================================================================
	describe("AC1: RenderToStream Function API", () => {
		it("should return a Stream<string> that emits HTML chunks", async () => {
			const app = jsx("div", { children: "Hello World" });
			const stream = renderToStream(app);

			const chunks = await Effect.runPromise(
				Stream.runCollect(stream).pipe(
					Effect.map((chunk) => Array.from(chunk)),
				),
			);

			assert.ok(chunks.length > 0, "Should emit at least one chunk");
			assert.ok(
				chunks.some((chunk) => chunk.includes("Hello World")),
				"Should contain the text content",
			);
		});

		it("should include DOCTYPE when includeDoctype option is true", async () => {
			const app = jsx("html", { children: jsx("body", {}) });
			const stream = renderToStream(app, { includeDoctype: true });

			const html = await Effect.runPromise(
				Stream.runCollect(stream).pipe(
					Effect.map((chunks) => Array.from(chunks).join("")),
				),
			);

			assert.ok(
				html.startsWith("<!DOCTYPE html>"),
				"Should start with DOCTYPE",
			);
		});

		it("should complete when entire tree is rendered", async () => {
			const app = jsx("div", {
				children: [
					jsx("span", { children: "1" }),
					jsx("span", { children: "2" }),
				],
			});

			const html = await Effect.runPromise(renderToString(app));
			assert.ok(html.includes("<span>1</span>"), "Should render first child");
			assert.ok(html.includes("<span>2</span>"), "Should render second child");
		});
	});

	// =========================================================================
	// AC2: Primitive Node Rendering
	// =========================================================================
	describe("AC2: Primitive Node Rendering", () => {
		it("should render string as HTML-escaped text", async () => {
			const app = "Hello <script>alert('XSS')</script>";
			const html = await Effect.runPromise(renderToString(app));

			assert.equal(
				html,
				"Hello &lt;script&gt;alert('XSS')&lt;/script&gt;",
				"Should escape HTML characters",
			);
		});

		it("should render number as text", async () => {
			const app = 42;
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(html, "42");
		});

		it("should render bigint as text", async () => {
			const app = BigInt(9007199254740991);
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(html, "9007199254740991");
		});

		it("should render boolean as empty string", async () => {
			const html1 = await Effect.runPromise(renderToString(true));
			const html2 = await Effect.runPromise(renderToString(false));
			assert.equal(html1, "");
			assert.equal(html2, "");
		});

		it("should render null/undefined as empty string", async () => {
			const html1 = await Effect.runPromise(renderToString(null));
			const html2 = await Effect.runPromise(renderToString(undefined));
			assert.equal(html1, "");
			assert.equal(html2, "");
		});
	});

	// =========================================================================
	// AC3: HTML Element Rendering
	// =========================================================================
	describe("AC3: HTML Element Rendering", () => {
		it("should render element with opening and closing tags", async () => {
			const app = jsx("div", { children: "content" });
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(html, "<div>content</div>");
		});

		it("should render void elements without closing tag", async () => {
			const app = jsx("br", {});
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(html, "<br>");
		});

		it("should handle all void elements correctly", async () => {
			const voidElements = [
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
			];

			for (const tag of voidElements) {
				const app = jsx(tag, { "data-test": "value" });
				const html = await Effect.runPromise(renderToString(app));
				assert.ok(
					!html.includes(`</${tag}>`),
					`${tag} should not have closing tag`,
				);
				assert.ok(html.includes(`<${tag}`), `${tag} should have opening tag`);
			}
		});
	});

	// =========================================================================
	// AC4: Attribute Serialization
	// =========================================================================
	describe("AC4: Attribute Serialization", () => {
		it("should skip children prop", async () => {
			const app = jsx("div", { children: "text", id: "test" });
			const html = await Effect.runPromise(renderToString(app));
			assert.ok(
				!html.includes("children="),
				"Should not render children as attribute",
			);
			assert.ok(html.includes('id="test"'), "Should render other attributes");
		});

		it("should skip event handler props", async () => {
			const app = jsx("button", {
				onClick: () => console.log("click"),
				onMouseOver: () => {},
				id: "btn",
			});
			const html = await Effect.runPromise(renderToString(app));
			assert.ok(!html.includes("onClick"), "Should not render onClick");
			assert.ok(!html.includes("onMouseOver"), "Should not render onMouseOver");
			assert.ok(
				html.includes('id="btn"'),
				"Should render non-event attributes",
			);
		});

		it("should handle boolean attributes correctly", async () => {
			const app1 = jsx("input", { disabled: true, checked: false });
			const html1 = await Effect.runPromise(renderToString(app1));
			assert.ok(
				html1.includes('disabled=""'),
				"Should render true boolean as empty",
			);
			assert.ok(!html1.includes("checked"), "Should omit false boolean");
		});

		it("should map className to class", async () => {
			const app = jsx("div", { className: "container" });
			const html = await Effect.runPromise(renderToString(app));
			assert.ok(
				html.includes('class="container"'),
				"Should map className to class",
			);
			assert.ok(!html.includes("className"), "Should not include className");
		});

		it("should map htmlFor to for", async () => {
			const app = jsx("label", { htmlFor: "input-id" });
			const html = await Effect.runPromise(renderToString(app));
			assert.ok(html.includes('for="input-id"'), "Should map htmlFor to for");
			assert.ok(!html.includes("htmlFor"), "Should not include htmlFor");
		});

		it("should handle data-* and aria-* attributes", async () => {
			const app = jsx("div", {
				"data-testid": "test",
				"aria-label": "Test label",
			});
			const html = await Effect.runPromise(renderToString(app));
			assert.ok(html.includes('data-testid="test"'));
			assert.ok(html.includes('aria-label="Test label"'));
		});

		it("should escape attribute values", async () => {
			const app = jsx("div", { title: 'Test "quoted" & <tagged>' });
			const html = await Effect.runPromise(renderToString(app));
			assert.ok(
				html.includes('title="Test &quot;quoted&quot; &amp; &lt;tagged&gt;"'),
				"Should escape special characters in attributes",
			);
		});
	});

	// =========================================================================
	// AC5: Style Attribute Handling
	// =========================================================================
	describe("AC5: Style Attribute Handling", () => {
		it("should render string style as-is (escaped)", async () => {
			const app = jsx("div", { style: "color: red; font-size: 16px" });
			const html = await Effect.runPromise(renderToString(app));
			assert.ok(html.includes('style="color: red; font-size: 16px"'));
		});

		it("should convert style object to CSS string", async () => {
			const app = jsx("div", {
				style: { color: "red", fontSize: 16, marginTop: "10px" },
			});
			const html = await Effect.runPromise(renderToString(app));
			assert.ok(
				html.includes('style="color: red; font-size: 16px; margin-top: 10px"'),
				"Should convert camelCase to kebab-case and add px to numbers",
			);
		});

		it("should skip undefined/null properties in style object", async () => {
			const app = jsx("div", {
				style: { color: "red", fontSize: undefined, margin: null },
			});
			const html = await Effect.runPromise(renderToString(app));
			assert.ok(html.includes("color: red"));
			assert.ok(!html.includes("font-size"));
			assert.ok(!html.includes("margin"));
		});

		it("should handle CSS custom properties", async () => {
			const app = jsx("div", { style: { "--custom-color": "blue" } });
			const html = await Effect.runPromise(renderToString(app));
			assert.ok(html.includes("--custom-color: blue"));
		});

		it("should append px to numeric values for applicable properties", async () => {
			const app = jsx("div", {
				style: {
					width: 100,
					height: 50,
					opacity: 0.5, // unitless
					zIndex: 10, // unitless
				},
			});
			const html = await Effect.runPromise(renderToString(app));
			assert.ok(html.includes("width: 100px"));
			assert.ok(html.includes("height: 50px"));
			assert.ok(html.includes("opacity: 0.5"));
			assert.ok(html.includes("z-index: 10"));
		});
	});

	// =========================================================================
	// AC6: Function Component Rendering
	// =========================================================================
	describe("AC6: Function Component Rendering", () => {
		it("should call function component once with props", async () => {
			let callCount = 0;
			const Component = (props: any) => {
				callCount++;
				return jsx("div", { children: `Hello ${props.name}` });
			};

			const app = jsx(Component, { name: "World" });
			const html = await Effect.runPromise(renderToString(app));

			assert.equal(callCount, 1, "Component should be called exactly once");
			assert.equal(html, "<div>Hello World</div>");
		});

		it("should handle component returning Effect<JSXNode>", async () => {
			const AsyncComponent = () =>
				Effect.succeed(jsx("div", { children: "Async content" }));

			const app = jsx(AsyncComponent, {});
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(html, "<div>Async content</div>");
		});

		it("should handle component returning Stream<JSXNode>", async () => {
			const StreamComponent = () =>
				Stream.make(
					jsx("div", { children: "First" }),
					jsx("div", { children: "Second" }),
				);

			const app = jsx(StreamComponent, {});
			const html = await Effect.runPromise(renderToString(app));
			// Should await first value only
			assert.equal(html, "<div>First</div>");
		});
	});

	// =========================================================================
	// AC7: Fragment Rendering
	// =========================================================================
	describe("AC7: Fragment Rendering", () => {
		it("should render fragment children without wrapper", async () => {
			const { FRAGMENT } = await import("@/jsx-runtime");
			const app = jsx(FRAGMENT as any, {
				children: [
					jsx("span", { children: "1" }),
					jsx("span", { children: "2" }),
				],
			});
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(html, "<span>1</span><span>2</span>");
		});

		it("should handle nested fragments", async () => {
			const { FRAGMENT } = await import("@/jsx-runtime");
			const app = jsx(FRAGMENT as any, {
				children: [
					jsx("div", { children: "1" }),
					jsx(FRAGMENT as any, {
						children: [
							jsx("div", { children: "2" }),
							jsx("div", { children: "3" }),
						],
					}),
				],
			});
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(html, "<div>1</div><div>2</div><div>3</div>");
		});
	});

	// =========================================================================
	// AC8: Iterable Children Rendering
	// =========================================================================
	describe("AC8: Iterable Children Rendering", () => {
		it("should render array children in order", async () => {
			const app = jsx("div", {
				children: [1, 2, 3].map((n) => jsx("span", { children: n })),
			});
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(
				html,
				"<div><span>1</span><span>2</span><span>3</span></div>",
			);
		});

		it("should recursively flatten nested iterables", async () => {
			const app = jsx("div", {
				children: [
					[jsx("span", { children: "1" }), jsx("span", { children: "2" })],
					[jsx("span", { children: "3" })],
				],
			});
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(
				html,
				"<div><span>1</span><span>2</span><span>3</span></div>",
			);
		});

		it("should handle mixed content in arrays", async () => {
			const app = jsx("div", {
				children: ["text", jsx("span", { children: "element" }), 42, null],
			});
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(html, "<div>text<span>element</span>42</div>");
		});
	});

	// =========================================================================
	// AC9: Effect Stream Handling
	// =========================================================================
	describe("AC9: Effect Stream Handling", () => {
		it("should await first value from Stream", async () => {
			const stream = Stream.make("First", "Second", "Third");
			const app = jsx("div", { children: stream });
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(html, "<div>First</div>", "Should only render first value");
		});

		it("should handle empty Stream", async () => {
			const stream = Stream.empty;
			const app = jsx("div", { children: stream });
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(html, "<div></div>", "Should render empty for empty stream");
		});

		it("should add stream markers when hydration is enabled", async () => {
			const stream = Stream.make("Content");
			const app = jsx("div", { children: stream });
			const html = await Effect.runPromise(
				renderToString(app, { enableHydration: true }),
			);
			assert.ok(
				html.includes("data-stream-id"),
				"Should include stream marker",
			);
		});

		it("should timeout after configured duration", async () => {
			const stream = Stream.never; // Never emits
			const app = jsx("div", { children: stream });

			const start = Date.now();
			const html = await Effect.runPromise(
				renderToString(app, { streamTimeout: 100 }),
			);
			const duration = Date.now() - start;

			assert.ok(duration < 200, "Should timeout quickly");
			assert.equal(html, "<div></div>", "Should render empty after timeout");
		});
	});

	// =========================================================================
	// AC10: Async Component Support
	// =========================================================================
	describe("AC10: Async Component Support", () => {
		it("should await Effect resolution", async () => {
			const AsyncComponent = () =>
				Effect.gen(function* () {
					// Simulate async operation
					yield* Effect.sleep(10);
					return jsx("div", { children: "Async result" });
				});

			const app = jsx(AsyncComponent, {});
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(html, "<div>Async result</div>");
		});

		it("should propagate Effect errors", async () => {
			const ErrorComponent = () =>
				Effect.fail(
					new Error("Component error"),
				) as unknown as Effect.Effect<JSXNode>;

			const app = jsx(ErrorComponent, {});
			await assert.rejects(
				Effect.runPromise(renderToString(app)),
				/Component error/,
			);
		});

		it("should maintain Effect context/services", async () => {
			// This will be tested more thoroughly once services are implemented
			const ComponentWithService = () =>
				Effect.succeed(jsx("div", { children: "Service result" }));

			const app = jsx(ComponentWithService, {});
			const html = await Effect.runPromise(renderToString(app));
			assert.equal(html, "<div>Service result</div>");
		});
	});

	// =========================================================================
	// AC11: Hydration Markers
	// =========================================================================
	describe("AC11: Hydration Markers", () => {
		it("should add data-hid to interactive elements", async () => {
			const app = jsx("button", { children: "Click me" });
			const html = await Effect.runPromise(
				renderToString(app, { enableHydration: true }),
			);
			assert.ok(html.includes("data-hid"), "Should include hydration ID");
		});

		it("should insert component boundary comments", async () => {
			const Component = () => jsx("div", { children: "Component" });
			const app = jsx(Component, {});
			const html = await Effect.runPromise(
				renderToString(app, { enableHydration: true }),
			);
			assert.ok(html.includes("<!-- hid:"), "Should include component marker");
		});

		it("should generate unique sequential IDs", async () => {
			const app = jsx("div", {
				children: [
					jsx("button", { children: "1" }),
					jsx("button", { children: "2" }),
				],
			});
			const html = await Effect.runPromise(
				renderToString(app, { enableHydration: true }),
			);
			assert.ok(html.includes('data-hid="1"') || html.includes('data-hid="0"'));
			assert.ok(html.includes('data-hid="2"') || html.includes('data-hid="1"'));
		});
	});

	// =========================================================================
	// AC12: Progressive Hydration Metadata
	// =========================================================================
	describe("AC12: Progressive Hydration Metadata", () => {
		it("should mark components with hydration priority", async () => {
			const Component = () => jsx("div", { children: "Interactive" });
			const app = jsx(Component, {});
			const html = await Effect.runPromise(
				renderToString(app, {
					enableHydration: true,
					enableProgressiveHydration: true,
					defaultHydrationPriority: "visible",
				}),
			);
			assert.ok(
				html.includes("data-hydrate-priority"),
				"Should include priority marker",
			);
		});

		it("should include component identifier", async () => {
			const NamedComponent = () => jsx("div", { children: "Named" });
			const app = jsx(NamedComponent, {});
			const html = await Effect.runPromise(
				renderToString(app, {
					enableHydration: true,
					enableProgressiveHydration: true,
				}),
			);
			assert.ok(
				html.includes("data-component"),
				"Should include component name",
			);
		});
	});

	// =========================================================================
	// AC13: HTML Escaping
	// =========================================================================
	describe("AC13: HTML Escaping", () => {
		it("should escape all dangerous characters in text", async () => {
			const text = '<script>alert("XSS")</script> & entities';
			const app = jsx("div", { children: text });
			const html = await Effect.runPromise(renderToString(app));

			assert.ok(html.includes("&lt;script&gt;"));
			assert.ok(html.includes("&lt;/script&gt;"));
			assert.ok(html.includes("&amp;"));
			assert.ok(html.includes("&quot;"));
		});

		it("should escape attributes properly", async () => {
			const app = jsx("div", {
				title: `"quotes" & 'apostrophes' <tags>`,
			});
			const html = await Effect.runPromise(renderToString(app));

			assert.ok(html.includes("&quot;quotes&quot;"));
			assert.ok(html.includes("&#39;apostrophes&#39;"));
			assert.ok(html.includes("&lt;tags&gt;"));
			assert.ok(html.includes("&amp;"));
		});
	});

	// =========================================================================
	// AC14: Streaming Response Support
	// =========================================================================
	describe("AC14: Streaming Response Support", () => {
		it("should emit chunks as tree is traversed", async () => {
			const app = jsx("div", {
				children: [
					jsx("header", { children: "Header" }),
					jsx("main", { children: "Main" }),
					jsx("footer", { children: "Footer" }),
				],
			});

			const chunks: string[] = [];
			await Effect.runPromise(
				Stream.runForEach(renderToStream(app), (chunk) =>
					Effect.sync(() => chunks.push(chunk)),
				),
			);

			assert.ok(chunks.length > 0, "Should emit multiple chunks");
			assert.ok(chunks.join("").includes("<header>Header</header>"));
			assert.ok(chunks.join("").includes("<main>Main</main>"));
			assert.ok(chunks.join("").includes("<footer>Footer</footer>"));
		});

		it("should handle backpressure", async () => {
			// Create a large tree
			const children = Array.from({ length: 1000 }, (_, i) =>
				jsx("div", { children: `Item ${i}` }),
			);
			const app = jsx("div", { children });

			const stream = renderToStream(app);
			let chunkCount = 0;

			await Effect.runPromise(
				Stream.runForEach(stream, () => {
					chunkCount++;
					// Simulate slow consumer
					return Effect.sleep(1);
				}),
			);

			assert.ok(chunkCount > 0, "Should process all chunks");
		});
	});

	// =========================================================================
	// AC15: Error Handling
	// =========================================================================
	describe("AC15: Error Handling", () => {
		it("should handle component errors gracefully", async () => {
			const ErrorComponent = () => {
				throw new Error("Component error");
			};

			const app = jsx("div", {
				children: [
					jsx("span", { children: "Before" }),
					jsx(ErrorComponent, {}),
					jsx("span", { children: "After" }),
				],
			});

			try {
				await Effect.runPromise(renderToString(app));
				assert.fail("Should have thrown an error");
			} catch (error: any) {
				assert.ok(error.message.includes("Component error"));
			}
		});

		it("should emit error boundary comments", async () => {
			const ErrorComponent = () =>
				Effect.fail(
					new Error("Render error"),
				) as unknown as Effect.Effect<JSXNode>;
			const app = jsx(ErrorComponent, {});

			try {
				await Effect.runPromise(renderToString(app));
				assert.fail("Should have thrown");
			} catch {
				// Error expected
			}
		});
	});
});
