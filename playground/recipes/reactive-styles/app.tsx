/**
 * Recipe: Reactive Styles
 *
 * This recipe demonstrates how to use streams for dynamic styling in effect-ui.
 * Styles can be static strings, objects with stream properties, or entire
 * style streams for complete style replacement.
 */

import { Effect, Schedule, Stream } from "effect";
import { mount } from "@/api";

// ============================================================================
// Example 1: Individual Style Properties as Streams
// ============================================================================

const AnimatedHue = () => {
	// Create a stream that cycles through hue values
	const hueStream = Stream.iterate(0, (h) => (h + 2) % 360).pipe(
		Stream.schedule(Schedule.spaced("50 millis")),
	);

	const backgroundStream = Stream.map(hueStream, (h) => `hsl(${h}, 70%, 60%)`);

	return (
		<div
			class="demo-box"
			style={{
				backgroundColor: backgroundStream,
				transition: "background-color 0.05s",
			}}
		>
			Hue
		</div>
	);
};

// ============================================================================
// Example 2: Object Form Styles (Static)
// ============================================================================

const ObjectStyleBox = () => (
	<div
		class="demo-box"
		style={{
			backgroundColor: "#667eea",
			boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
		}}
	>
		Object
	</div>
);

// ============================================================================
// Example 3: Entire Style Object as Stream
// ============================================================================

const StyleSwitcher = () => {
	const styleStream = Stream.make(
		{
			backgroundColor: "#667eea",
			transform: "scale(1)",
		},
		{
			backgroundColor: "#764ba2",
			transform: "scale(1.1)",
		},
		{
			backgroundColor: "#4CAF50",
			transform: "scale(0.9)",
		},
	).pipe(Stream.schedule(Schedule.spaced("1 second")), Stream.forever);

	return (
		<div
			class="demo-box"
			style={{
				...styleStream,
				transition: "all 0.3s ease",
			}}
		>
			Switch
		</div>
	);
};

// ============================================================================
// Example 4: Pulsing Animation
// ============================================================================

const PulsingBox = () => {
	const opacityStream = Stream.make(1, 0.5).pipe(
		Stream.schedule(Schedule.spaced("800 millis")),
		Stream.forever,
	);

	return (
		<div
			class="demo-box"
			style={{
				backgroundColor: "#764ba2",
				opacity: opacityStream,
				transition: "opacity 0.4s ease-in-out",
			}}
		>
			Pulse
		</div>
	);
};

// ============================================================================
// Example 5: Size Animation
// ============================================================================

const GrowingBox = () => {
	const sizeStream = Stream.iterate(100, (s) => (s >= 150 ? 100 : s + 10)).pipe(
		Stream.schedule(Schedule.spaced("200 millis")),
	);

	return (
		<div
			class="demo-box"
			style={{
				backgroundColor: "#4CAF50",
				width: Stream.map(sizeStream, (s) => `${s}px`),
				height: Stream.map(sizeStream, (s) => `${s}px`),
				transition: "width 0.2s, height 0.2s",
			}}
		>
			Grow
		</div>
	);
};

// ============================================================================
// App
// ============================================================================

const App = () => (
	<div>
		<a href="../" class="back-link">
			&larr; Back to Recipes
		</a>
		<h1>Reactive Styles</h1>

		<section>
			<h2>1. Animated Hue (Individual Property Stream)</h2>
			<p>Background color cycles through the color wheel.</p>
			<AnimatedHue />
		</section>

		<section>
			<h2>2. Object Form Styles (Static)</h2>
			<p>Standard object syntax for style properties.</p>
			<ObjectStyleBox />
		</section>

		<section>
			<h2>3. Style Object Stream</h2>
			<p>Entire style object changes over time.</p>
			<StyleSwitcher />
		</section>

		<section>
			<h2>4. Pulsing Opacity</h2>
			<p>Opacity alternates between values.</p>
			<PulsingBox />
		</section>

		<section>
			<h2>5. Growing Size</h2>
			<p>Width and height animate via streams.</p>
			<GrowingBox />
		</section>
	</div>
);

// biome-ignore lint/style/noNonNullAssertion: playground code, element always exists
Effect.runPromise(mount(<App />, document.getElementById("root")!));
