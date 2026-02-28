/**
 * Basic SSR example demonstrating server-side rendering with effect-ui
 */

import { Effect, Stream } from "effect";
import type { JSXNode } from "@/jsx-runtime";
import { Fragment, jsx } from "@/jsx-runtime";
import { renderToStream, renderToString } from "@/ssr";

// ============================================================================
// Components
// ============================================================================

interface LayoutProps {
	title: string;
	children: JSXNode;
}

function Layout({ title, children }: LayoutProps) {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				<style>{`
					body {
						font-family: system-ui, -apple-system, sans-serif;
						margin: 0;
						padding: 20px;
						background: #f5f5f5;
					}
					.container {
						max-width: 800px;
						margin: 0 auto;
						background: white;
						padding: 20px;
						border-radius: 8px;
						box-shadow: 0 2px 4px rgba(0,0,0,0.1);
					}
					h1 {
						color: #333;
						margin-top: 0;
					}
					.counter {
						padding: 10px;
						background: #e3f2fd;
						border-radius: 4px;
						margin: 20px 0;
					}
					button {
						background: #2196f3;
						color: white;
						border: none;
						padding: 8px 16px;
						border-radius: 4px;
						cursor: pointer;
						font-size: 14px;
					}
					button:hover {
						background: #1976d2;
					}
					.stream-content {
						padding: 10px;
						background: #f0f0f0;
						border-radius: 4px;
						margin: 10px 0;
					}
				`}</style>
			</head>
			<body>
				<div class="container">{children}</div>
			</body>
		</html>
	);
}

interface CounterProps {
	initialCount?: number;
}

function Counter({ initialCount = 0 }: CounterProps) {
	// Note: This is server-side only, so onClick won't work until hydrated
	return (
		<div class="counter">
			<h2>Counter Component</h2>
			<p>Count: {initialCount}</p>
			<button onClick={() => console.log("Clicked!")}>
				Increment (requires hydration)
			</button>
			<p>
				<small>
					This button won't work until the component is hydrated on the client.
				</small>
			</p>
		</div>
	);
}

// Async component that fetches data
function AsyncDataComponent() {
	return Effect.gen(function* () {
		// Simulate async data fetching
		yield* Effect.sleep(10);
		const data = yield* Effect.succeed({
			users: ["Alice", "Bob", "Charlie"],
			timestamp: new Date().toISOString(),
		});

		return (
			<div>
				<h2>Async Data Component</h2>
				<p>Fetched at: {data.timestamp}</p>
				<ul>
					{data.users.map((user) => (
						<li key={user}>{user}</li>
					))}
				</ul>
			</div>
		);
	});
}

// Component that uses streams
function StreamingComponent() {
	// In SSR, only the first value will be rendered
	const messages = Stream.make(
		"Initial message",
		"Second message (won't render in SSR)",
		"Third message (won't render in SSR)",
	);

	return (
		<div>
			<h2>Streaming Component</h2>
			<div class="stream-content">
				<p>Message: {messages}</p>
			</div>
			<p>
				<small>
					During SSR, only the first stream value is rendered. Full streaming
					requires client-side hydration.
				</small>
			</p>
		</div>
	);
}

// Main app component
function App() {
	return (
		<Layout title="effect-ui SSR Example">
			<h1>Server-Side Rendering with effect-ui</h1>

			<p>
				This page is server-rendered using effect-ui's SSR capabilities. It
				demonstrates:
			</p>

			<ul>
				<li>Basic HTML generation</li>
				<li>Async component rendering</li>
				<li>Stream handling (first value only)</li>
				<li>Hydration markers for progressive enhancement</li>
			</ul>

			<Counter initialCount={42} />

			<AsyncDataComponent />

			<StreamingComponent />

			<div>
				<h2>Features</h2>
				<p>This SSR implementation supports:</p>
				<ul>
					<li>✅ HTML escaping for XSS prevention</li>
					<li>✅ Async components with Effect</li>
					<li>✅ Stream first-value rendering</li>
					<li>✅ Progressive hydration markers</li>
					<li>✅ Streaming HTML responses</li>
					<li>✅ Custom components and fragments</li>
				</ul>
			</div>
		</Layout>
	);
}

// ============================================================================
// Example Usage
// ============================================================================

async function main() {
	console.log("🚀 Starting SSR example...\n");

	// Example 1: Render to string
	console.log("📝 Example 1: Render to string");
	console.log("=".repeat(50));

	const html = await Effect.runPromise(
		renderToString(<App />, {
			includeDoctype: true,
			enableHydration: true,
			enableProgressiveHydration: true,
		}),
	);

	console.log("Generated HTML length:", html.length, "characters");
	console.log("\nFirst 500 characters:");
	console.log(html.substring(0, 500) + "...\n");

	// Example 2: Render to stream
	console.log("🌊 Example 2: Render to stream");
	console.log("=".repeat(50));

	const stream = renderToStream(<App />, {
		includeDoctype: true,
		enableHydration: true,
	});

	const chunks: string[] = [];
	await Effect.runPromise(
		Stream.runForEach(stream, (chunk) =>
			Effect.sync(() => {
				chunks.push(chunk);
				console.log(`Received chunk: ${chunk.length} characters`);
			}),
		),
	);

	console.log(`\nTotal chunks received: ${chunks.length}`);
	console.log(`Total HTML size: ${chunks.join("").length} characters\n`);

	// Example 3: Error handling
	console.log("⚠️  Example 3: Error handling");
	console.log("=".repeat(50));

	const ErrorComponent = () => {
		throw new Error("Component rendering error!");
	};

	try {
		await Effect.runPromise(renderToString(<ErrorComponent />));
	} catch (error) {
		console.log("Caught error:", error);
		console.log("Error handling works correctly!\n");
	}

	// Example 4: Simple component
	console.log("🎯 Example 4: Simple component");
	console.log("=".repeat(50));

	const SimpleComponent = () => (
		<div class="simple">
			<h1>Hello from SSR!</h1>
			<p>This is a simple server-rendered component.</p>
		</div>
	);

	const simpleHtml = await Effect.runPromise(
		renderToString(<SimpleComponent />),
	);
	console.log("Simple component HTML:");
	console.log(simpleHtml);

	console.log("\n✅ SSR example completed successfully!");
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error);
}
