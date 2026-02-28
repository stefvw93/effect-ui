/**
 * Server-side playground for effect-ui SSR
 *
 * This server demonstrates:
 * - Server-side rendering with effect-ui
 * - Streaming HTML responses
 * - Progressive hydration markers
 * - Async component rendering
 * - Effect Streams handling
 */

import {
	createServer,
	type IncomingMessage,
	type ServerResponse,
} from "node:http";
import { URL } from "node:url";
import { Effect, Stream } from "effect";
import type { JSXNode } from "@/jsx-runtime";
import { renderToStream } from "@/ssr";
import {
	EffectComponent,
	NestedEffectComponent,
	SimpleEffectComponent,
} from "./test-effect-component";

// ============================================================================
// Server Configuration
// ============================================================================

const PORT = Number.parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "localhost";

// ============================================================================
// Components
// ============================================================================

interface PageLayoutProps {
	title: string;
	children: JSXNode;
	currentPath: string;
}

function PageLayout({ title, children, currentPath }: PageLayoutProps) {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title} | effect-ui SSR Playground</title>
				<style>{getStyles()}</style>
			</head>
			<body>
				<div class="layout">
					<header class="header">
						<div class="header-content">
							<h1 class="logo">
								<span class="logo-icon">⚡</span>
								effect-ui SSR Playground
							</h1>
							<nav class="nav">
								<a href="/" class={currentPath === "/" ? "active" : ""}>
									Home
								</a>
								<a
									href="/examples"
									class={currentPath === "/examples" ? "active" : ""}
								>
									Examples
								</a>
								<a
									href="/streaming"
									class={currentPath === "/streaming" ? "active" : ""}
								>
									Streaming
								</a>
								<a
									href="/async"
									class={currentPath === "/async" ? "active" : ""}
								>
									Async
								</a>
								<a
									href="/api/data"
									class={currentPath === "/api/data" ? "active" : ""}
								>
									API
								</a>
							</nav>
						</div>
					</header>
					<main class="main">{children}</main>
					<footer class="footer">
						<p>Server rendered at: {new Date().toLocaleTimeString()}</p>
						<p>
							<a href="http://localhost:3000" target="_blank" rel="noopener">
								→ Client Playground
							</a>{" "}
							|{" "}
							<a
								href="https://github.com/stefvw93/effect-ui"
								target="_blank"
								rel="noopener"
							>
								GitHub
							</a>
						</p>
					</footer>
				</div>
			</body>
		</html>
	);
}

// Home Page Component
function HomePage() {
	return (
		<div class="page home">
			<div class="hero">
				<h2>Welcome to effect-ui Server Playground</h2>
				<p class="lead">
					Experience server-side rendering with Effect, Streams, and reactive
					components
				</p>
			</div>

			<div class="features">
				<div class="feature-card">
					<h3>🚀 Streaming HTML</h3>
					<p>
						Responses are streamed as they're generated for optimal time to
						first byte (TTFB).
					</p>
				</div>
				<div class="feature-card">
					<h3>⚡ Async Components</h3>
					<p>
						Components can use Effect to handle async operations during
						server-side rendering.
					</p>
				</div>
				<div class="feature-card">
					<h3>🌊 Stream Support</h3>
					<p>
						Effect Streams are handled gracefully - SSR awaits the first emitted
						value.
					</p>
				</div>
				<div class="feature-card">
					<h3>💧 Progressive Hydration</h3>
					<p>
						Components are marked for client-side hydration with configurable
						priorities.
					</p>
				</div>
			</div>

			<div class="info-box">
				<h3>How It Works</h3>
				<p>
					This server renders JSX components to HTML using effect-ui's SSR
					capabilities. Each request generates fresh HTML on the server, which
					is then sent to the browser. The HTML includes hydration markers that
					allow the client to progressively enhance the page with interactivity.
				</p>
				<pre>
					<code>{`// Server-side rendering example
const html = await Effect.runPromise(
  renderToString(<App />, {
    includeDoctype: true,
    enableHydration: true
  })
);`}</code>
				</pre>
			</div>
		</div>
	);
}

// Examples Page Component
function ExamplesPage() {
	// Simple counter (static - needs hydration for interactivity)
	const counterValue = 42;

	return (
		<div class="page examples">
			<h2>SSR Examples</h2>

			<section class="example">
				<h3>Static Counter</h3>
				<div class="counter-demo">
					<div class="counter-display">{counterValue}</div>
					<button type="button" class="btn btn-primary">
						Increment (needs client hydration)
					</button>
					<p class="note">
						This counter is rendered with an initial value of {counterValue}.
						Interactivity requires client-side hydration.
					</p>
				</div>
			</section>

			<section class="example">
				<h3>Server Time</h3>
				<div class="time-display">
					<div class="time-value">{new Date().toLocaleTimeString()}</div>
					<p class="note">
						This time was rendered on the server. Refresh the page to see it
						update.
					</p>
				</div>
			</section>

			<section class="example">
				<h3>List Rendering</h3>
				<ul class="demo-list">
					{["React", "Vue", "Angular", "Svelte", "effect-ui"].map(
						(framework) => (
							<li key={framework}>
								<span class="framework-name">{framework}</span>
								{framework === "effect-ui" && (
									<span class="badge">Current</span>
								)}
							</li>
						),
					)}
				</ul>
			</section>

			<section class="example">
				<h3>Conditional Rendering</h3>
				<div class="conditional-demo">
					{Math.random() > 0.5 ? (
						<div class="alert alert-success">✅ Random condition was true!</div>
					) : (
						<div class="alert alert-info">ℹ️ Random condition was false!</div>
					)}
					<p class="note">Refresh to see different results.</p>
				</div>
			</section>
		</div>
	);
}

// Streaming Demo Page
function StreamingPage() {
	// In SSR, streams only render their first value
	const numbers = Stream.iterate(1, (n) => n + 1).pipe(Stream.take(5));

	const messages = Stream.make(
		"First message (rendered)",
		"Second message (not rendered in SSR)",
		"Third message (not rendered in SSR)",
	);

	return (
		<div class="page streaming">
			<h2>Stream Handling in SSR</h2>

			<section class="example">
				<h3>Stream First Value</h3>
				<p>During SSR, Effect Streams render only their first emitted value:</p>
				<div class="stream-demo">
					<div class="stream-value">Message: {messages}</div>
				</div>
				<pre>
					<code>{`const messages = Stream.make(
  "First message (rendered)",
  "Second message (not rendered in SSR)",
  "Third message (not rendered in SSR)"
);`}</code>
				</pre>
			</section>

			<section class="example">
				<h3>Number Stream</h3>
				<div class="stream-demo">
					<div class="stream-value">Current number: {numbers}</div>
				</div>
				<p class="note">
					The stream would continue emitting on the client after hydration.
				</p>
			</section>

			<section class="example">
				<h3>Why First Value Only?</h3>
				<div class="info-box">
					<p>
						SSR needs to produce a static HTML snapshot. Since streams emit
						values over time, the server:
					</p>
					<ul>
						<li>Awaits the first emitted value</li>
						<li>Renders it to HTML</li>
						<li>Adds hydration markers for client-side resumption</li>
						<li>Times out if no value is emitted quickly enough</li>
					</ul>
				</div>
			</section>
		</div>
	);
}

// Async Demo Page
function AsyncPage() {
	return (
		<div class="page async">
			<h2>Async Components</h2>

			<section class="example">
				<h3>Effect Component Tests</h3>
				<p>Testing different Effect component patterns:</p>

				<div style="margin-bottom: 20px;">
					<h4>1. Effect.gen Component</h4>
					<EffectComponent />
				</div>

				<div style="margin-bottom: 20px;">
					<h4>2. Effect.succeed Component</h4>
					<SimpleEffectComponent />
				</div>

				<div style="margin-bottom: 20px;">
					<h4>3. Nested Effect Component</h4>
					<NestedEffectComponent />
				</div>
			</section>

			<section class="example">
				<h3>Effect-based Async Data</h3>
				<AsyncDataLoader />
			</section>

			<section class="example">
				<h3>Simulated API Call</h3>
				<AsyncUserList />
			</section>

			<section class="example">
				<h3>Delayed Content</h3>
				<DelayedContent delay={100} />
			</section>
		</div>
	);
}

// Async component that loads data
// NOTE: Components returning Effect.gen() currently have issues with YieldWrap
// objects during SSR. This is a known limitation that needs further investigation.
// For now, async data should be loaded before rendering or components should
// return JSX directly.
function AsyncDataLoader() {
	// Simulate pre-loaded data (in real SSR, this would be fetched beforehand)
	const data = {
		timestamp: Date.now(),
		random: Math.random(),
		serverInfo: {
			node: process.version,
			platform: process.platform,
			memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
		},
	};

	return (
		<div class="async-data">
			<h4>Server-Generated Data:</h4>
			<pre>
				<code>{JSON.stringify(data, null, 2)}</code>
			</pre>
			<p class="note">Data generated during SSR</p>
		</div>
	);
}

// Async component that simulates user fetching
function AsyncUserList() {
	// In real SSR, this data would be pre-fetched
	const users = [
		{ id: 1, name: "Alice", role: "Developer" },
		{ id: 2, name: "Bob", role: "Designer" },
		{ id: 3, name: "Charlie", role: "Product Manager" },
	];

	return (
		<div class="user-list">
			<h4>Users (Server Rendered):</h4>
			<div class="user-grid">
				{users.map((user) => (
					<div key={user.id} class="user-card">
						<div class="user-name">{user.name}</div>
						<div class="user-role">{user.role}</div>
					</div>
				))}
			</div>
			<p class="note">User data rendered during SSR</p>
		</div>
	);
}

// Delayed content component
interface DelayedContentProps {
	delay: number;
}

function DelayedContent({ delay }: DelayedContentProps) {
	// In real SSR, content would be ready without delay
	return (
		<div class="delayed-content">
			<div class="alert alert-info">
				📄 This content would be delayed by {delay}ms with Effect.gen
			</div>
			<p class="note">Rendered synchronously during SSR</p>
		</div>
	);
}

// API Response
function ApiResponse() {
	const data = {
		message: "Hello from effect-ui SSR API!",
		timestamp: new Date().toISOString(),
		method: "GET",
		headers: {
			"content-type": "application/json",
			"x-powered-by": "effect-ui",
		},
	};

	return (
		<pre class="api-response">
			<code>{JSON.stringify(data, null, 2)}</code>
		</pre>
	);
}

// 404 Page
function NotFoundPage({ path }: { path: string }) {
	return (
		<div class="page not-found">
			<div class="error-container">
				<h2>404 - Page Not Found</h2>
				<p>
					The path <code>{path}</code> does not exist.
				</p>
				<a href="/" class="btn btn-primary">
					Go Home
				</a>
			</div>
		</div>
	);
}

// ============================================================================
// Styles
// ============================================================================

function getStyles(): string {
	return `
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
			line-height: 1.6;
			color: #333;
			background: #f8f9fa;
		}

		.layout {
			min-height: 100vh;
			display: flex;
			flex-direction: column;
		}

		/* Header */
		.header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			padding: 1rem 0;
			box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		}

		.header-content {
			max-width: 1200px;
			margin: 0 auto;
			padding: 0 2rem;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.logo {
			font-size: 1.5rem;
			font-weight: 700;
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}

		.logo-icon {
			font-size: 1.8rem;
		}

		.nav {
			display: flex;
			gap: 2rem;
		}

		.nav a {
			color: rgba(255, 255, 255, 0.9);
			text-decoration: none;
			padding: 0.5rem 1rem;
			border-radius: 0.25rem;
			transition: all 0.2s;
		}

		.nav a:hover {
			background: rgba(255, 255, 255, 0.1);
			color: white;
		}

		.nav a.active {
			background: rgba(255, 255, 255, 0.2);
			color: white;
		}

		/* Main Content */
		.main {
			flex: 1;
			max-width: 1200px;
			margin: 2rem auto;
			padding: 0 2rem;
			width: 100%;
		}

		.page {
			background: white;
			border-radius: 0.5rem;
			padding: 2rem;
			box-shadow: 0 1px 3px rgba(0,0,0,0.1);
		}

		/* Home Page */
		.hero {
			text-align: center;
			margin-bottom: 3rem;
		}

		.hero h2 {
			font-size: 2.5rem;
			color: #667eea;
			margin-bottom: 1rem;
		}

		.lead {
			font-size: 1.25rem;
			color: #666;
		}

		.features {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 2rem;
			margin-bottom: 3rem;
		}

		.feature-card {
			padding: 1.5rem;
			background: #f8f9fa;
			border-radius: 0.5rem;
			border: 1px solid #e9ecef;
		}

		.feature-card h3 {
			margin-bottom: 0.5rem;
			color: #495057;
		}

		/* Examples Page */
		.example {
			margin-bottom: 2rem;
			padding-bottom: 2rem;
			border-bottom: 1px solid #e9ecef;
		}

		.example:last-child {
			border-bottom: none;
		}

		.example h3 {
			margin-bottom: 1rem;
			color: #495057;
		}

		.counter-demo {
			display: flex;
			align-items: center;
			gap: 1rem;
			flex-wrap: wrap;
		}

		.counter-display {
			font-size: 3rem;
			font-weight: bold;
			color: #667eea;
			min-width: 100px;
			text-align: center;
		}

		.time-display {
			padding: 1rem;
			background: #f8f9fa;
			border-radius: 0.5rem;
		}

		.time-value {
			font-size: 2rem;
			font-family: monospace;
			color: #495057;
		}

		.demo-list {
			list-style: none;
			padding: 0;
		}

		.demo-list li {
			padding: 0.75rem;
			background: #f8f9fa;
			margin-bottom: 0.5rem;
			border-radius: 0.25rem;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.framework-name {
			font-weight: 500;
		}

		/* Stream Demo */
		.stream-demo {
			background: #f8f9fa;
			padding: 1.5rem;
			border-radius: 0.5rem;
			margin: 1rem 0;
		}

		.stream-value {
			font-size: 1.25rem;
			color: #495057;
			font-family: monospace;
		}

		/* Async Demo */
		.async-data {
			background: #f8f9fa;
			padding: 1rem;
			border-radius: 0.5rem;
		}

		.user-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			gap: 1rem;
			margin-top: 1rem;
		}

		.user-card {
			padding: 1rem;
			background: white;
			border: 1px solid #e9ecef;
			border-radius: 0.5rem;
		}

		.user-name {
			font-weight: 600;
			margin-bottom: 0.25rem;
		}

		.user-role {
			color: #6c757d;
			font-size: 0.875rem;
		}

		.delayed-content {
			margin-top: 1rem;
		}

		/* API Response */
		.api-response {
			background: #282c34;
			color: #abb2bf;
			padding: 1.5rem;
			border-radius: 0.5rem;
			overflow-x: auto;
		}

		/* Utility Classes */
		.btn {
			display: inline-block;
			padding: 0.75rem 1.5rem;
			border: none;
			border-radius: 0.25rem;
			font-size: 1rem;
			text-decoration: none;
			cursor: pointer;
			transition: all 0.2s;
		}

		.btn-primary {
			background: #667eea;
			color: white;
		}

		.btn-primary:hover {
			background: #5a67d8;
		}

		.badge {
			display: inline-block;
			padding: 0.25rem 0.5rem;
			background: #667eea;
			color: white;
			border-radius: 0.25rem;
			font-size: 0.75rem;
			font-weight: 600;
		}

		.alert {
			padding: 1rem;
			border-radius: 0.25rem;
			margin: 1rem 0;
		}

		.alert-success {
			background: #d4edda;
			color: #155724;
			border: 1px solid #c3e6cb;
		}

		.alert-info {
			background: #d1ecf1;
			color: #0c5460;
			border: 1px solid #bee5eb;
		}

		.info-box {
			background: #f8f9fa;
			padding: 1.5rem;
			border-radius: 0.5rem;
			margin-top: 2rem;
		}

		.info-box h3 {
			margin-bottom: 1rem;
			color: #495057;
		}

		.note {
			color: #6c757d;
			font-size: 0.875rem;
			margin-top: 0.5rem;
		}

		pre {
			margin: 1rem 0;
		}

		code {
			font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
			font-size: 0.875rem;
		}

		pre code {
			display: block;
			padding: 1rem;
			background: #f8f9fa;
			border-radius: 0.25rem;
			overflow-x: auto;
		}

		/* 404 Page */
		.not-found {
			text-align: center;
			padding: 4rem 2rem;
		}

		.error-container h2 {
			font-size: 3rem;
			color: #dc3545;
			margin-bottom: 1rem;
		}

		.error-container code {
			background: #f8f9fa;
			padding: 0.25rem 0.5rem;
			border-radius: 0.25rem;
		}

		/* Footer */
		.footer {
			background: #343a40;
			color: #adb5bd;
			text-align: center;
			padding: 2rem;
			margin-top: auto;
		}

		.footer a {
			color: #adb5bd;
			text-decoration: none;
		}

		.footer a:hover {
			color: white;
			text-decoration: underline;
		}

		/* Responsive */
		@media (max-width: 768px) {
			.header-content {
				flex-direction: column;
				gap: 1rem;
			}

			.nav {
				flex-wrap: wrap;
				justify-content: center;
			}

			.features {
				grid-template-columns: 1fr;
			}

			.hero h2 {
				font-size: 2rem;
			}

			.counter-display {
				font-size: 2rem;
			}
		}
	`;
}

// ============================================================================
// Request Handling
// ============================================================================

async function handleRequest(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const url = new URL(req.url || "/", `http://${req.headers.host}`);
	const path = url.pathname;

	// Log request
	console.log(`[${new Date().toISOString()}] ${req.method} ${path}`);

	// Handle API routes
	if (path === "/api/data") {
		res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
		const apiStream = renderToStream(<ApiResponse />, {
			enableHydration: false,
		});

		await Effect.runPromise(
			Stream.runForEach(apiStream, (chunk) =>
				Effect.sync(() => res.write(chunk)),
			),
		);
		res.end();
		return;
	}

	// Determine which page to render
	let pageContent: JSXNode;
	let pageTitle: string;
	let statusCode = 200;

	switch (path) {
		case "/":
			pageContent = <HomePage />;
			pageTitle = "Home";
			break;
		case "/examples":
			pageContent = <ExamplesPage />;
			pageTitle = "Examples";
			break;
		case "/streaming":
			pageContent = <StreamingPage />;
			pageTitle = "Streaming";
			break;
		case "/async":
			pageContent = <AsyncPage />;
			pageTitle = "Async Components";
			break;
		default:
			statusCode = 404;
			pageContent = <NotFoundPage path={path} />;
			pageTitle = "404 Not Found";
	}

	// Render the page
	const app = (
		<PageLayout title={pageTitle} currentPath={path}>
			{pageContent}
		</PageLayout>
	);

	// Set response headers
	res.writeHead(statusCode, {
		"Content-Type": "text/html; charset=utf-8",
		"X-Powered-By": "effect-ui SSR",
	});

	try {
		// Stream the response
		const htmlStream = renderToStream(app, {
			includeDoctype: true,
			enableHydration: true,
			enableProgressiveHydration: true,
			defaultHydrationPriority: "visible",
		});

		await Effect.runPromise(
			Stream.runForEach(htmlStream, (chunk) =>
				Effect.async<void>((resume) => {
					res.write(chunk, (err) => {
						if (err) {
							console.error("Write error:", err);
							resume(Effect.die(err));
						} else {
							resume(Effect.succeed(undefined));
						}
					});
				}),
			),
		);

		res.end();
	} catch (error) {
		console.error("SSR Error:", error);
		// If headers haven't been sent yet, we can send an error response
		if (!res.headersSent) {
			res.writeHead(500);
			res.end(`
				<!DOCTYPE html>
				<html>
					<head><title>Server Error</title></head>
					<body>
						<h1>500 - Internal Server Error</h1>
						<p>An error occurred while rendering the page.</p>
						<pre>${error}</pre>
					</body>
				</html>
			`);
		} else {
			// Headers already sent, just end the response
			res.end();
		}
	}
}

// ============================================================================
// Server Initialization
// ============================================================================

function startServer() {
	const server = createServer(handleRequest);

	server.listen(PORT, HOST, () => {
		console.log("╔════════════════════════════════════════════════════════╗");
		console.log("║                                                        ║");
		console.log("║          ⚡ effect-ui SSR Playground Server ⚡         ║");
		console.log("║                                                        ║");
		console.log("╠════════════════════════════════════════════════════════╣");
		console.log("║                                                        ║");
		console.log(`║  Server:   http://${HOST}:${PORT}                       ║`);
		console.log("║  Status:   Ready to accept connections                 ║");
		console.log("║                                                        ║");
		console.log("╠════════════════════════════════════════════════════════╣");
		console.log("║                                                        ║");
		console.log("║  Routes:                                               ║");
		console.log("║    • /           Home page                             ║");
		console.log("║    • /examples   SSR examples                          ║");
		console.log("║    • /streaming  Stream handling demo                  ║");
		console.log("║    • /async      Async components demo                 ║");
		console.log("║    • /api/data   API response example                  ║");
		console.log("║                                                        ║");
		console.log("╠════════════════════════════════════════════════════════╣");
		console.log("║                                                        ║");
		console.log("║  Commands:                                             ║");
		console.log("║    • Press Ctrl+C to stop the server                   ║");
		console.log("║    • Run 'pnpm dev' for client playground              ║");
		console.log("║                                                        ║");
		console.log("╚════════════════════════════════════════════════════════╝");
	});

	// Handle graceful shutdown
	process.on("SIGINT", () => {
		console.log("\n\n🛑 Shutting down server...");
		server.close(() => {
			console.log("✅ Server closed successfully");
			process.exit(0);
		});
	});

	process.on("SIGTERM", () => {
		console.log("\n\n🛑 Received SIGTERM, shutting down...");
		server.close(() => {
			console.log("✅ Server closed successfully");
			process.exit(0);
		});
	});
}

// Start the server
startServer();
