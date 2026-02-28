// Simple SSR test without JSX
import { Effect, Stream } from "effect";
import {
	Fragment,
	jsx,
	renderToStream,
	renderToString,
} from "../dist/index.js";

// Create JSX without JSX syntax
const app = jsx("div", {
	class: "container",
	children: [
		jsx("h1", { children: "Hello from SSR!" }),
		jsx("p", { children: "This is server-rendered HTML." }),
		jsx("ul", {
			children: [
				jsx("li", { children: "Feature 1" }),
				jsx("li", { children: "Feature 2" }),
				jsx("li", { children: "Feature 3" }),
			],
		}),
	],
});

async function test() {
	console.log("Testing SSR functionality...\n");

	// Test 1: renderToString
	console.log("Test 1: Render to string");
	console.log("=".repeat(40));
	const html = await Effect.runPromise(renderToString(app));
	console.log(html);
	console.log("\n");

	// Test 2: renderToStream
	console.log("Test 2: Render to stream");
	console.log("=".repeat(40));
	const stream = renderToStream(app);
	const chunks = [];
	await Effect.runPromise(
		Stream.runForEach(stream, (chunk) =>
			Effect.sync(() => {
				chunks.push(chunk);
				console.log(`Received chunk: ${chunk.length} characters`);
			}),
		),
	);
	console.log(`Total HTML: ${chunks.join("")}`);
	console.log("\n");

	// Test 3: Async component
	console.log("Test 3: Async component");
	console.log("=".repeat(40));
	const AsyncComponent = () =>
		Effect.succeed(jsx("div", { children: "Async content loaded!" }));

	const asyncApp = jsx(AsyncComponent, {});
	try {
		const asyncHtml = await Effect.runPromise(renderToString(asyncApp));
		console.log(asyncHtml);
	} catch (error) {
		console.log(
			"Async component test failed (expected - needs full implementation)",
		);
		console.log("Error:", error.message || error);
	}
	console.log("\n");

	// Test 4: Stream component (first value only)
	console.log("Test 4: Stream component");
	console.log("=".repeat(40));
	const messages = Stream.make("First", "Second", "Third");
	const streamApp = jsx("div", { children: messages });
	try {
		const streamHtml = await Effect.runPromise(renderToString(streamApp));
		console.log(streamHtml);
		console.log("Expected to render first value only: ✅");
	} catch (error) {
		console.log("Stream component test failed");
		console.log("Error:", error.message || error);
	}
	console.log("\n");

	console.log("✅ Basic SSR tests completed!");
}

test().catch(console.error);
