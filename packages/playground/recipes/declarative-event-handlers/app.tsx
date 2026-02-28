/**
 * Recipe: Declarative DOM Event Handlers
 *
 * This recipe demonstrates how to use event handlers in effect-ui.
 * Handlers can be plain callbacks OR return Effects, with service access
 * through the existing Effect.provide() pattern.
 */

import { mount } from "@effect-ui/dom";
import { Context, Effect, Layer, Stream } from "effect";

// ============================================================================
// Example 1: Stream Composition Counter
// ============================================================================

/**
 * A counter built entirely from stream composition, demonstrating:
 * - Effect.andThen to wait for DOM readiness
 * - Stream.fromEventListener for click events
 * - Stream.merge to combine increment/decrement streams
 * - Stream.scan to accumulate state
 * - Stream.concat for initial value
 */
const StreamCounter = () =>
	Effect.gen(function* () {
		// Generate unique IDs for this instance
		const incId = `inc-${Math.random().toString(36).slice(2, 8)}`;
		const decId = `dec-${Math.random().toString(36).slice(2, 8)}`;

		// Build a reactive count stream using composition
		const clickStream = Stream.fromEffect(
			// Wait for DOM to be ready (next microtask after mount)
			Effect.andThen(
				Effect.promise(() => Promise.resolve(true)),
				() =>
					Effect.sync(() => ({
						// biome-ignore lint/style/noNonNullAssertion: buttons exist after mount
						incBtn: document.getElementById(incId)!,
						// biome-ignore lint/style/noNonNullAssertion: buttons exist after mount
						decBtn: document.getElementById(decId)!,
					})),
			),
		).pipe(
			// Create click streams and merge them with +1/-1 values
			Stream.flatMap(({ incBtn, decBtn }) =>
				Stream.merge(
					Stream.fromEventListener(incBtn, "click").pipe(Stream.map(() => 1)),
					Stream.fromEventListener(decBtn, "click").pipe(Stream.map(() => -1)),
				),
			),
			// Accumulate the count
			Stream.scan(0, (acc, delta) => acc + delta),
		);

		// Prepend initial value of 0
		const count = Stream.concat(Stream.make(0), clickStream);

		return (
			<div>
				<span class="counter">{count}</span>
				<button type="button" id={decId}>
					-
				</button>
				<button type="button" id={incId}>
					+
				</button>
			</div>
		);
	});

// ============================================================================
// Example 2: Effect-Returning Handlers
// ============================================================================

const LoggingButton = () => (
	<button
		type="button"
		onclick={() =>
			Effect.gen(function* () {
				yield* Effect.log("Button clicked!");
				yield* Effect.sleep("100 millis");
				yield* Effect.log("Action completed");
			})
		}
	>
		Click to Log
	</button>
);

// ============================================================================
// Example 3: Handlers with Service Access
// ============================================================================

// Define an analytics service
class Analytics extends Context.Tag("Analytics")<
	Analytics,
	{
		track: (event: string) => Effect.Effect<void>;
	}
>() {}

const AnalyticsLive = Layer.succeed(Analytics, {
	track: (event) =>
		Effect.sync(() => {
			console.log(`[Analytics] Tracked: ${event}`);
		}),
});

const TrackedButton = () => (
	<button
		type="button"
		onclick={() =>
			Effect.gen(function* () {
				const analytics = yield* Analytics;
				yield* analytics.track("button_clicked");
			})
		}
	>
		Tracked Click
	</button>
);

// ============================================================================
// Example 4: Reactive Handlers (Stream-based)
// ============================================================================

const ToggleHandler = () => {
	// Handler that alternates between two behaviors
	const handlers = Stream.make(
		() => console.log("Mode A: Hello!"),
		() => console.log("Mode B: Goodbye!"),
	);

	return (
		<button type="button" onclick={handlers}>
			Click (handler changes)
		</button>
	);
};

// ============================================================================
// Example 5: Conditional Handlers
// ============================================================================

const ConditionalButton = ({ enabled }: { enabled: boolean }) => (
	<button
		type="button"
		onclick={
			enabled
				? () => {
						console.log("Action performed!");
					}
				: null
		}
	>
		{enabled ? "Click Me" : "Disabled"}
	</button>
);

// ============================================================================
// App
// ============================================================================

const App = () => (
	<div>
		<a href="../" class="back-link">
			&larr; Back to Recipes
		</a>
		<h1>Event Handler Examples</h1>

		<section>
			<h2>1. Stream Composition Counter</h2>
			<p>Built from Stream.fromEventListener, merge, and scan.</p>
			<StreamCounter />
		</section>

		<section>
			<h2>2. Effect-Returning Handler</h2>
			<LoggingButton />
		</section>

		<section>
			<h2>3. Service Access in Handler</h2>
			<TrackedButton />
		</section>

		<section>
			<h2>4. Reactive Handler</h2>
			<ToggleHandler />
		</section>

		<section>
			<h2>5. Conditional Handler</h2>
			<ConditionalButton enabled={true} />
			<ConditionalButton enabled={false} />
		</section>
	</div>
);

// Mount with services provided
Effect.runPromise(
	// biome-ignore lint/style/noNonNullAssertion: playground code, element always exists
	mount(<App />, document.getElementById("root")!).pipe(
		Effect.provide(AnalyticsLive),
	),
);
