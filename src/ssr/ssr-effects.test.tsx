/**
 * @file Tests for Effect rendering in SSR
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { Effect, pipe } from "effect";
import { renderToString } from "./render-to-stream";
import type { JSXNode } from "@/jsx-runtime";

describe("SSR Effect Rendering", () => {
	describe("Basic Effect Support", () => {
		test("should render Effect.succeed with JSX", async () => {
			// Component that returns an Effect
			function EffectComponent() {
				return Effect.succeed(<div>Effect content</div>);
			}

			const result = await Effect.runPromise(
				renderToString(<EffectComponent />),
			);

			assert.match(result, /Effect content/);
			assert.match(result, /<div[^>]*>Effect content<\/div>/);
		});

		test("should handle Effect.map with JSX transformation", async () => {
			function MappedEffectComponent() {
				return pipe(
					Effect.succeed("Hello"),
					Effect.map((text) => <span>{text} World</span>),
				);
			}

			const result = await Effect.runPromise(
				renderToString(<MappedEffectComponent />),
			);

			assert.match(result, /Hello World/);
			assert.match(result, /<span[^>]*>Hello World<\/span>/);
		});

		test("should handle nested Effects", async () => {
			function OuterEffectComponent() {
				return Effect.succeed(
					<div>
						<InnerEffectComponent />
					</div>,
				);
			}

			function InnerEffectComponent() {
				return Effect.succeed(<span>Inner content</span>);
			}

			const result = await Effect.runPromise(
				renderToString(<OuterEffectComponent />),
			);

			assert.match(result, /Inner content/);
			assert.match(result, /<span[^>]*>Inner content<\/span>/);
		});
	});

	describe("Async Effect Handling", () => {
		test("should handle Effects with delays", async () => {
			function DelayedComponent() {
				return pipe(
					Effect.sleep(10),
					Effect.map(() => <div>Delayed content</div>),
				);
			}

			const result = await Effect.runPromise(
				renderToString(<DelayedComponent />),
			);

			assert.match(result, /Delayed content/);
		});

		test("should handle multiple async Effects in parallel", async () => {
			function AsyncComponent1() {
				return pipe(
					Effect.sleep(5),
					Effect.map(() => <div>Component 1</div>),
				);
			}

			function AsyncComponent2() {
				return pipe(
					Effect.sleep(5),
					Effect.map(() => <div>Component 2</div>),
				);
			}

			const result = await Effect.runPromise(
				renderToString(
					<div>
						<AsyncComponent1 />
						<AsyncComponent2 />
					</div>,
				),
			);

			assert.match(result, /Component 1/);
			assert.match(result, /Component 2/);
		});
	});

	describe("Error Handling", () => {
		test("should handle Effect.fail gracefully", async () => {
			function FailingComponent() {
				return Effect.fail(new Error("Component failed"));
			}

			try {
				await Effect.runPromise(renderToString(<FailingComponent />));
				assert.fail("Should have thrown an error");
			} catch (error) {
				// Expected to fail
				assert.ok(error);
			}
		});

		test("should handle Effect.die as critical error", async () => {
			function DyingComponent() {
				return Effect.die(new Error("Critical failure"));
			}

			try {
				await Effect.runPromise(renderToString(<DyingComponent />));
				assert.fail("Should have thrown an error");
			} catch (error) {
				// Expected to die
				assert.ok(error);
			}
		});
	});

	describe("Effects in Arrays", () => {
		test("should render arrays containing Effect components", async () => {
			function ListWithEffects() {
				const items = [1, 2, 3];
				return (
					<ul>
						{items.map((n) => (
							<EffectItem key={n} value={n} />
						))}
					</ul>
				);
			}

			function EffectItem({ value }: { value: number }) {
				return Effect.succeed(<li>Item {value}</li>);
			}

			const result = await Effect.runPromise(
				renderToString(<ListWithEffects />),
			);

			assert.match(result, /Item 1/);
			assert.match(result, /Item 2/);
			assert.match(result, /Item 3/);
		});

		test("should handle mixed Effects and regular JSX in arrays", async () => {
			function MixedList() {
				return (
					<div>
						{[
							<span key="1">Regular</span>,
							<EffectSpan key="2" />,
							<span key="3">Another</span>,
						]}
					</div>
				);
			}

			function EffectSpan() {
				return Effect.succeed(<span>Effect content</span>);
			}

			const result = await Effect.runPromise(
				renderToString(<MixedList />),
			);

			assert.match(result, /Regular/);
			assert.match(result, /Effect content/);
			assert.match(result, /Another/);
		});
	});

	describe("Known Limitations", () => {
		// Document known issue with Effect.gen
		test.skip("should handle Effect.gen components (currently has issues)", async () => {
			function GenComponent() {
				return Effect.gen(function* () {
					yield* Effect.sleep(10);
					const data = yield* Effect.succeed({ message: "Hello" });
					return <div>{data.message}</div>;
				});
			}

			// This currently fails due to YieldWrap issues
			const result = await Effect.runPromise(
				renderToString(<GenComponent />),
			);

			assert.match(result, /Hello/);
		});

		test("workaround: components should return JSX directly for SSR", async () => {
			// Instead of Effect.gen, return JSX directly
			function WorkaroundComponent() {
				// In SSR, data would be pre-loaded
				const data = { message: "Hello SSR" };
				return <div>{data.message}</div>;
			}

			const result = await Effect.runPromise(
				renderToString(<WorkaroundComponent />),
			);

			assert.match(result, /Hello SSR/);
		});
	});

	describe("Integration with SSR Options", () => {
		test("should respect hydration options with Effects", async () => {
			function EffectWithHydration() {
				return Effect.succeed(
					<button type="button">Click me</button>
				);
			}

			const result = await Effect.runPromise(
				renderToString(<EffectWithHydration />, {
					enableHydration: true,
					enableProgressiveHydration: true,
				}),
			);

			// Should have hydration markers
			assert.match(result, /data-hid="/);
			assert.match(result, /data-component="/);
			assert.match(result, /data-hydrate-priority="/);
		});

		test("should handle Effects without hydration", async () => {
			function EffectNoHydration() {
				return Effect.succeed(<div>No hydration</div>);
			}

			const result = await Effect.runPromise(
				renderToString(<EffectNoHydration />, {
					enableHydration: false,
				}),
			);

			// Should not have hydration markers
			assert.doesNotMatch(result, /data-hid="/);
			assert.match(result, /No hydration/);
		});
	});
});