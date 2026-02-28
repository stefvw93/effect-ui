import { Effect } from "effect";

// Test what Effect.gen actually returns
const testEffect = Effect.gen(function* () {
	return <div>Test</div>;
});

console.log("Effect.gen returns:", testEffect);
console.log("Is it an Effect?", Effect.isEffect(testEffect));
console.log("Object keys:", Object.keys(testEffect));
console.log("Object proto:", Object.getPrototypeOf(testEffect));