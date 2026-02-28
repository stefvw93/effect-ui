/**
 * Node.js HTTP server example with effect-ui SSR
 */

import { createServer } from "node:http";
import { Effect, Stream } from "effect";
import type { JSXNode } from "@/jsx-runtime";
import { jsx } from "@/jsx-runtime";
import { renderToStream } from "@/ssr";

// ============================================================================
// Application Components
// ============================================================================

interface PageProps {
	path: string;
	timestamp: string;
}

function Page({ path, timestamp }: PageProps) {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>effect-ui SSR Server</title>
				<style>{`
					body {
						font-family: system-ui, -apple-system, sans-serif;
						margin: 0;
						padding: 0;
						background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
						min-height: 100vh;
						display: flex;
						align-items: center;
						justify-content: center;
					}
					.container {
						background: white;
						border-radius: 12px;
						padding: 40px;
						box-shadow: 0 20px 40px rgba(0,0,0,0.1);
						max-width: 600px;
						width: 90%;
					}
					h1 {
						color: #333;
						margin: 0 0 20px 0;
						font-size: 32px;
					}
					.info {
						background: #f7f8fa;
						border-radius: 8px;
						padding: 20px;
						margin: 20px 0;
					}
					.info h2 {
						margin-top: 0;
						color: #667eea;
						font-size: 18px;
					}
					code {
						background: #f0f0f0;
						padding: 2px 6px;
						border-radius: 3px;
						font-family: 'Monaco', 'Courier New', monospace;
						font-size: 14px;
					}
					.nav {
						display: flex;
						gap: 15px;
						margin: 20px 0;
					}
					.nav a {
						color: #667eea;
						text-decoration: none;
						padding: 8px 16px;
						border: 2px solid #667eea;
						border-radius: 6px;
						transition: all 0.3s;
					}
					.nav a:hover {
						background: #667eea;
						color: white;
					}
					.nav a.active {
						background: #667eea;
						color: white;
					}
					.footer {
						margin-top: 30px;
						padding-top: 20px;
						border-top: 1px solid #e0e0e0;
						color: #666;
						font-size: 14px;
					}
				`}</style>
			</head>
			<body>
				<div class="container">
					<h1>🚀 effect-ui SSR Server</h1>

					<div class="nav">
						<a href="/" class={path === "/" ? "active" : ""}>
							Home
						</a>
						<a href="/about" class={path === "/about" ? "active" : ""}>
							About
						</a>
						<a href="/features" class={path === "/features" ? "active" : ""}>
							Features
						</a>
					</div>

					{path === "/" && <HomePage />}
					{path === "/about" && <AboutPage />}
					{path === "/features" && <FeaturesPage />}
					{!["", "/", "/about", "/features"].includes(path) && (
						<NotFoundPage path={path} />
					)}

					<div class="footer">
						<p>Rendered at: {timestamp}</p>
						<p>Powered by effect-ui Server-Side Rendering</p>
					</div>
				</div>
			</body>
		</html>
	);
}

function HomePage() {
	return (
		<div class="info">
			<h2>Welcome to effect-ui SSR!</h2>
			<p>
				This is a demonstration of server-side rendering with effect-ui. Every
				page you see is rendered on the server and sent as HTML.
			</p>
			<p>
				Try navigating to different pages using the links above. Each request is
				handled by the Node.js server and rendered fresh.
			</p>
		</div>
	);
}

function AboutPage() {
	return (
		<div class="info">
			<h2>About effect-ui SSR</h2>
			<p>
				effect-ui's SSR capability allows you to render your Effect-based
				React-like components on the server, providing:
			</p>
			<ul>
				<li>🎯 Better SEO - Search engines can crawl your content</li>
				<li>⚡ Faster initial load - Users see content immediately</li>
				<li>📱 Better performance on slow devices</li>
				<li>🔄 Progressive enhancement with hydration</li>
			</ul>
		</div>
	);
}

function FeaturesPage() {
	return (
		<div class="info">
			<h2>SSR Features</h2>
			<ul>
				<li>✅ Stream-based rendering for efficient memory usage</li>
				<li>✅ Support for async components with Effect</li>
				<li>✅ Automatic HTML escaping for security</li>
				<li>✅ Progressive hydration markers</li>
				<li>✅ First-value rendering for Effect Streams</li>
				<li>✅ Error boundaries and graceful degradation</li>
				<li>✅ TypeScript type safety throughout</li>
			</ul>
			<p>
				The server can handle streaming responses, allowing the browser to start
				rendering before the entire page is generated.
			</p>
		</div>
	);
}

function NotFoundPage({ path }: { path: string }) {
	return (
		<div class="info">
			<h2>404 - Page Not Found</h2>
			<p>
				The path <code>{path}</code> was not found on this server.
			</p>
			<p>
				Try going back to the <a href="/">home page</a>.
			</p>
		</div>
	);
}

// ============================================================================
// HTTP Server
// ============================================================================

/**
 * Creates an HTTP server with SSR support
 */
function createSSRServer(port = 3000) {
	const server = createServer(async (req, res) => {
		const path = req.url || "/";
		const timestamp = new Date().toISOString();

		console.log(`[${timestamp}] ${req.method} ${path}`);

		// Set response headers
		res.setHeader("Content-Type", "text/html; charset=utf-8");

		try {
			// Create the JSX tree for the current request
			const app = <Page path={path} timestamp={timestamp} />;

			// Render to stream
			const htmlStream = renderToStream(app, {
				includeDoctype: true,
				enableHydration: true,
				enableProgressiveHydration: true,
			});

			// Stream the response to the client
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

			// End the response
			res.end();
		} catch (error) {
			console.error("SSR Error:", error);
			res.statusCode = 500;
			res.end(`
				<!DOCTYPE html>
				<html>
					<head><title>Server Error</title></head>
					<body>
						<h1>500 - Server Error</h1>
						<p>An error occurred while rendering the page.</p>
						<pre>${error}</pre>
					</body>
				</html>
			`);
		}
	});

	server.listen(port, () => {
		console.log("=".repeat(50));
		console.log("🚀 effect-ui SSR Server");
		console.log("=".repeat(50));
		console.log(`Server running at: http://localhost:${port}`);
		console.log("\nAvailable routes:");
		console.log("  • http://localhost:3000/");
		console.log("  • http://localhost:3000/about");
		console.log("  • http://localhost:3000/features");
		console.log("\nPress Ctrl+C to stop the server");
		console.log("=".repeat(50));
	});

	// Handle server shutdown gracefully
	process.on("SIGINT", () => {
		console.log("\n\nShutting down server...");
		server.close(() => {
			console.log("Server closed. Goodbye! 👋");
			process.exit(0);
		});
	});

	return server;
}

// ============================================================================
// Main Entry Point
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
	const port = Number.parseInt(process.env.PORT || "3000", 10);
	createSSRServer(port);
}
