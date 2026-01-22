/**
 * Recipe: Type Augmentation for Context Requirements
 *
 * This recipe demonstrates how to register your app's Effect context types
 * with the JSX type system using TypeScript's interface augmentation.
 *
 * By default, JSX children can have any context requirements. Augmenting
 * JSX.Requirements enables stricter compile-time checking - TypeScript will
 * error if a component uses a service not registered in the interface.
 */

import { Context, Effect, Layer } from "effect";
import { mount } from "@/api";

// Define your services
const MyValue = Context.GenericTag<{ value: string }>("MyValue");
const Theme = Context.GenericTag<{ primary: string }>("Theme");

// Augment JSX.Requirements to register app-level context types
// Use `_` as a single key with a union of all service types
declare global {
	namespace JSX {
		interface Requirements {
			_:
				| Context.Tag.Service<typeof MyValue>
				| Context.Tag.Service<typeof Theme>;
		}
	}
}

// Create layers for your services
const MyValueLayer = Layer.succeed(MyValue, { value: "Hello, world!" });
const ThemeLayer = Layer.succeed(Theme, { primary: "#007bff" });
const AppLayer = Layer.merge(MyValueLayer, ThemeLayer);

// Components can now use registered services with full type safety
const Greeting = () =>
	Effect.gen(function* () {
		const { value } = yield* MyValue;
		const { primary } = yield* Theme;
		return <span style={{ color: primary }}>{value}</span>;
	});

const App = () => (
	<div>
		<Greeting />
	</div>
);

// Provide all services at the mount boundary
Effect.runPromise(mount(<App />, document.body).pipe(Effect.provide(AppLayer)));
