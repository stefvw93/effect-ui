/**
 * Test Effect component for SSR debugging
 */

import { Effect } from "effect";
import type { JSXNode } from "@/jsx-runtime";

// Simple Effect component that returns JSX
export function EffectComponent() {
	// Return an Effect that resolves to JSX
	return Effect.gen(function* () {
		// Simulate some async work
		yield* Effect.log("Rendering EffectComponent on server");

		// Return JSX
		return (
			<div class="effect-component">
				<h3>Effect Component</h3>
				<p>This component uses Effect.gen and should render correctly in SSR</p>
				<div>Timestamp: {Date.now()}</div>
			</div>
		);
	});
}

// Component that returns Effect without generator
export function SimpleEffectComponent() {
	return Effect.succeed(
		<div class="simple-effect-component">
			<h3>Simple Effect Component</h3>
			<p>This component uses Effect.succeed</p>
		</div>
	);
}

// Component with nested Effects
export function NestedEffectComponent() {
	return (
		<div class="nested-effect">
			<h3>Nested Effect Component</h3>
			{Effect.succeed(<p>Nested Effect content</p>)}
		</div>
	);
}