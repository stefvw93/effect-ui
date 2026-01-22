/**
 * Recipe: Declarative DOM Event Handlers
 *
 * This recipe demonstrates how to use event handlers in effect-ui.
 * Handlers can be plain callbacks OR return Effects, with service access
 * through the existing Effect.provide() pattern.
 */

import { Context, Effect, Layer, Stream } from "effect";
import { mount } from "@/api";

// ============================================================================
// Example 1: Plain Callback Handlers
// ============================================================================

const Counter = () => {
	let count = 0;
	const countStream = Stream.async<number>((emit) => {
		emit.single(count);
	});

	return (
		<div>
			<span>Count: {countStream}</span>
			<button
				type="button"
				onclick={() => {
					count++;
					// Note: This is a simple example. In real apps, you'd emit to a stream.
				}}
			>
				Increment
			</button>
		</div>
	);
};

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
			<h2>1. Plain Callback</h2>
			<Counter />
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
