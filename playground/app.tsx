import { Effect, Schedule, Stream } from "effect";
import { mount } from "../src/dom";

// ============================================================================
// Example 1: Basic Counter with Streams
// ============================================================================

function Counter() {
	// Create a stream that emits incrementing numbers every second
	const counterStream = Stream.iterate(0, (n) => n + 1).pipe(
		Stream.schedule(Schedule.spaced(1000)),
		Stream.take(60), // Stop after 60 seconds
	);

	return (
		<div class="demo-section">
			<h2>Auto-incrementing Counter</h2>
			<div class="counter">{counterStream}</div>
			<p>Updates every second using Stream.iterate</p>
		</div>
	);
}

// ============================================================================
// Example 2: Dynamic Styles with Streams
// ============================================================================

function DynamicStyles() {
	// Cycle through colors
	const colors = ["#667eea", "#764ba2", "#f093fb", "#f5576c"];
	const colorStream = Stream.fromIterable(colors).pipe(
		Stream.repeat(Schedule.spaced(2000)),
		Stream.take(100),
	);

	// Animate size
	const sizeStream = Stream.iterate(100, (n) =>
		n === 150 ? 100 : n + 10,
	).pipe(
		Stream.schedule(Schedule.spaced(500)),
		Stream.map((n) => `${n}px`),
		Stream.take(100),
	);

	return (
		<div class="demo-section">
			<h2>Dynamic Styles</h2>
			<div
				style={{
					width: sizeStream,
					height: "100px",
					backgroundColor: colorStream,
					borderRadius: "8px",
					transition: "all 0.5s ease",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "white",
					fontWeight: "bold",
				}}
			>
				Animated Box
			</div>
			<p>Color and size change using streams</p>
		</div>
	);
}

// ============================================================================
// Example 3: Status Indicator with Effect
// ============================================================================

function StatusIndicator() {
	// Simulate status checks
	const statusStream = Stream.make("pending", "checking...").pipe(
		Stream.concat(
			Stream.fromEffect(Effect.delay(Effect.succeed("online"), 2000)),
		),
		Stream.concat(
			Stream.fromEffect(Effect.delay(Effect.succeed("offline"), 5000)),
		),
		Stream.concat(
			Stream.fromEffect(Effect.delay(Effect.succeed("online"), 8000)),
		),
	);

	return (
		<div class="demo-section">
			<h2>Status Indicator</h2>
			<div>
				Current Status:{" "}
				<span class={Stream.map(statusStream, (s) => `status ${s}`)}>
					{statusStream}
				</span>
			</div>
			<p>Status changes over time using Effects with delays</p>
		</div>
	);
}

// ============================================================================
// Example 4: Clock Display
// ============================================================================

function Clock() {
	const timeStream = Stream.fromSchedule(Schedule.spaced(1000)).pipe(
		Stream.map(() => new Date().toLocaleTimeString()),
		Stream.take(3600), // Run for 1 hour
	);

	return (
		<div class="demo-section">
			<h2>Live Clock</h2>
			<div class="stream-value">{timeStream}</div>
			<p>Updates every second using Stream.fromSchedule</p>
		</div>
	);
}

// ============================================================================
// Example 5: Random Number Generator
// ============================================================================

function RandomNumbers() {
	const randomStream = Stream.fromSchedule(Schedule.spaced(1500)).pipe(
		Stream.map(() => Math.floor(Math.random() * 100)),
		Stream.take(40),
	);

	return (
		<div class="demo-section">
			<h2>Random Number Generator</h2>
			<div class="stream-value">
				Random Number: <strong>{randomStream}</strong>
			</div>
			<p>Generates a new random number every 1.5 seconds</p>
		</div>
	);
}

// ============================================================================
// Example 6: List with Streaming Items
// ============================================================================

function StreamingList() {
	const items = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];
	const listStream = Stream.fromIterable(items).pipe(
		Stream.scan([] as string[], (acc, item) => [...acc, item]),
		Stream.schedule(Schedule.spaced(1000)),
	);

	return (
		<div class="demo-section">
			<h2>Streaming List</h2>
			<ul>
				{Stream.map(listStream, (items) =>
					items.map((item) => <li>{item}</li>),
				)}
			</ul>
			<p>Items appear one by one</p>
		</div>
	);
}

// ============================================================================
// Example 7: Mixed Static and Dynamic Content
// ============================================================================

function MixedContent() {
	const dynamicPart = Stream.fromIterable([
		"amazing",
		"fantastic",
		"incredible",
		"awesome",
	]).pipe(Stream.repeat(Schedule.spaced(2000)), Stream.take(50));

	return (
		<div class="demo-section">
			<h2>Mixed Content</h2>
			<p>
				Effect UI is <strong>{dynamicPart}</strong>! It combines static content
				with dynamic streams seamlessly.
			</p>
		</div>
	);
}

// ============================================================================
// Main App Component
// ============================================================================

function App() {
	return (
		<>
			<h1>🎨 Effect UI Playground</h1>
			<p style={{ marginBottom: "2rem", color: "#666" }}>
				Demonstrating reactive DOM rendering with Effect streams
			</p>

			<Counter />
			<DynamicStyles />
			<StatusIndicator />
			<Clock />
			<RandomNumbers />
			<StreamingList />
			<MixedContent />

			<div
				style={{
					marginTop: "2rem",
					padding: "1rem",
					background: "#f0f0f0",
					borderRadius: "8px",
				}}
			>
				<p style={{ fontSize: "0.9rem", color: "#666" }}>
					All examples use Effect streams for reactive updates. The DOM
					automatically subscribes to streams and updates when new values are
					emitted.
				</p>
			</div>
		</>
	);
}

// ============================================================================
// Mount the app
// ============================================================================

const root = document.getElementById("root");
if (root) {
	Effect.runPromise(mount(<App />, root)).then(
		() => console.log("✅ App mounted successfully"),
		(error) => console.error("❌ Failed to mount app:", error),
	);
} else {
	console.error("Root element not found");
}
