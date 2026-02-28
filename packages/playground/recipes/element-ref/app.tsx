/**
 * Recipe: Element Ref
 *
 * This recipe demonstrates using Effect's Ref and SubscriptionRef to get
 * direct references to DOM elements after they are mounted.
 *
 * Element refs provide:
 * - Direct access to DOM elements for imperative operations
 * - Type-safe references (HTMLInputElement, HTMLCanvasElement, etc.)
 * - Reactive mount detection via SubscriptionRef.changes
 */

import { mount } from "@effect-ui/dom";
import { Effect, Option, pipe, Stream, SubscriptionRef } from "effect";

// ============================================================================
// Example 1: Auto-focus Input on Mount
// ============================================================================

/**
 * Demonstrates focusing an input element immediately after mount.
 */
const AutoFocusInput = () =>
	Effect.gen(function* () {
		const inputRef = yield* SubscriptionRef.make<
			Option.Option<HTMLInputElement>
		>(Option.none());

		// Subscribe to ref changes and focus when element is mounted
		yield* pipe(
			inputRef.changes,
			Stream.filter(Option.isSome),
			Stream.take(1),
			Stream.runForEach((option) =>
				Effect.sync(() => {
					const element = Option.getOrThrow(option);
					element.focus();
				}),
			),
			Effect.fork,
		);

		return (
			<div>
				<p>This input is automatically focused on mount:</p>
				<input
					ref={inputRef}
					type="text"
					placeholder="I'm focused!"
					style={{ padding: "0.5rem", fontSize: "1rem" }}
				/>
			</div>
		);
	});

// ============================================================================
// Example 2: Measure Element Dimensions
// ============================================================================

/**
 * Demonstrates measuring element dimensions after mount.
 */
const MeasureElement = () =>
	Effect.gen(function* () {
		const boxRef = yield* SubscriptionRef.make<Option.Option<HTMLElement>>(
			Option.none(),
		);
		const dimensions = yield* SubscriptionRef.make("Measuring...");

		// Measure dimensions when element is mounted
		yield* pipe(
			boxRef.changes,
			Stream.filter(Option.isSome),
			Stream.take(1),
			Stream.runForEach((option) =>
				Effect.gen(function* () {
					const element = Option.getOrThrow(option);
					const rect = element.getBoundingClientRect();
					yield* SubscriptionRef.set(
						dimensions,
						`Width: ${rect.width}px, Height: ${rect.height}px`,
					);
				}),
			),
			Effect.fork,
		);

		return (
			<div>
				<div
					ref={boxRef}
					style={{
						width: "200px",
						height: "100px",
						background: "#f0f0f0",
						border: "2px solid #000",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					Measured Box
				</div>
				<p style={{ marginTop: "0.5rem" }}>
					Dimensions: <strong>{dimensions.changes}</strong>
				</p>
			</div>
		);
	});

// ============================================================================
// Example 3: Canvas Drawing
// ============================================================================

/**
 * Demonstrates drawing on a canvas element after mount.
 */
const CanvasDrawing = () =>
	Effect.gen(function* () {
		const canvasRef = yield* SubscriptionRef.make<
			Option.Option<HTMLCanvasElement>
		>(Option.none());

		// Draw on canvas when mounted
		yield* pipe(
			canvasRef.changes,
			Stream.filter(Option.isSome),
			Stream.take(1),
			Stream.runForEach((option) =>
				Effect.sync(() => {
					const canvas = Option.getOrThrow(option);
					const ctx = canvas.getContext("2d");
					if (!ctx) return;

					// Draw a simple pattern
					ctx.fillStyle = "#000";
					ctx.fillRect(10, 10, 80, 80);

					ctx.fillStyle = "#666";
					ctx.beginPath();
					ctx.arc(150, 50, 40, 0, Math.PI * 2);
					ctx.fill();

					ctx.fillStyle = "#999";
					ctx.beginPath();
					ctx.moveTo(250, 10);
					ctx.lineTo(290, 90);
					ctx.lineTo(210, 90);
					ctx.closePath();
					ctx.fill();
				}),
			),
			Effect.fork,
		);

		return (
			<div>
				<p>Shapes drawn on canvas after mount:</p>
				<canvas
					ref={canvasRef}
					width={300}
					height={100}
					style={{ border: "1px solid #000", background: "#fff" }}
				/>
			</div>
		);
	});

// ============================================================================
// Example 4: Scroll Into View
// ============================================================================

/**
 * Demonstrates scrolling an element into view on button click.
 */
const ScrollIntoView = () =>
	Effect.gen(function* () {
		const targetRef = yield* SubscriptionRef.make<Option.Option<HTMLElement>>(
			Option.none(),
		);

		const scrollToTarget = () =>
			Effect.gen(function* () {
				const option = yield* SubscriptionRef.get(targetRef);
				if (Option.isSome(option)) {
					Option.getOrThrow(option).scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				}
			});

		return (
			<div>
				<button type="button" onclick={() => scrollToTarget()}>
					Scroll to Target
				</button>
				<div
					style={{
						height: "200px",
						overflow: "auto",
						border: "1px solid #ccc",
						marginTop: "0.5rem",
					}}
				>
					<div
						style={{ height: "150px", background: "#f9f9f9", padding: "1rem" }}
					>
						Scroll down to find the target...
					</div>
					<div
						style={{ height: "150px", background: "#f0f0f0", padding: "1rem" }}
					>
						Keep scrolling...
					</div>
					<div
						ref={targetRef}
						style={{
							padding: "1rem",
							background: "#000",
							color: "#fff",
							textAlign: "center",
						}}
					>
						Target Element
					</div>
					<div
						style={{ height: "150px", background: "#f0f0f0", padding: "1rem" }}
					>
						More content below...
					</div>
				</div>
			</div>
		);
	});

// ============================================================================
// App
// ============================================================================

const App = () => (
	<div>
		<a href="../" class="back-link">
			&larr; Back to Recipes
		</a>
		<h1>Element Ref</h1>

		<section>
			<h2>1. Auto-focus Input</h2>
			<p>Focus an input element immediately after mount.</p>
			<AutoFocusInput />
		</section>

		<section>
			<h2>2. Measure Element Dimensions</h2>
			<p>Get element dimensions using getBoundingClientRect().</p>
			<MeasureElement />
		</section>

		<section>
			<h2>3. Canvas Drawing</h2>
			<p>Draw on a canvas element after mount.</p>
			<CanvasDrawing />
		</section>

		<section>
			<h2>4. Scroll Into View</h2>
			<p>Scroll to an element using scrollIntoView().</p>
			<ScrollIntoView />
		</section>
	</div>
);

// biome-ignore lint/style/noNonNullAssertion: playground code, element always exists
Effect.runPromise(mount(<App />, document.getElementById("root")!));
