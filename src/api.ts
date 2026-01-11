import { Effect, Exit, Layer, ManagedRuntime, Scope } from "effect";
import {
	type InvalidElementTypeError,
	type MountHandle,
	RenderContext,
	type RenderError,
	type StreamSubscriptionError,
} from "./dom";
import type { JSXNode } from "./jsx-runtime";
import { renderNode } from "./render-core";

/**
 * Mounts a JSX tree to a DOM element with full reactive support.
 *
 * - Clears the root element's existing children
 * - Renders the JSX tree to DOM nodes
 * - Sets up reactive subscriptions for Stream/Effect values
 * - Returns Effect that completes after initial render (streams run in background)
 * - Creates a fresh ManagedRuntime per mount
 * - Returns a cleanup handle to unmount and dispose resources
 *
 * @param app - JSX tree to render
 * @param root - HTMLElement to mount to
 * @returns Effect that yields MountHandle for cleanup
 *
 * @example
 * ```tsx
 * const app = <div>Hello World</div>;
 * const root = document.getElementById("root")!;
 * const handle = await Effect.runPromise(mount(app, root));
 * // Later: cleanup
 * await Effect.runPromise(handle.unmount());
 * ```
 */

export function mount(
	app: JSXNode,
	root: HTMLElement,
): Effect.Effect<
	MountHandle,
	InvalidElementTypeError | StreamSubscriptionError | RenderError
> {
	return Effect.gen(function* () {
		// AC24: Create fresh ManagedRuntime per mount
		const runtime = ManagedRuntime.make(Layer.empty);
		const scope = yield* Scope.make();

		// Create the RenderContext service implementation
		const context = {
			runtime,
			scope,
			streamIdCounter: { current: 0 },
		};

		// AC1: Clear root element's existing children
		root.innerHTML = "";

		// AC1: Render the JSX tree with the provided context
		const result = yield* renderNode(app).pipe(
			Effect.provideService(RenderContext, context),
		);

		// AC1: Append rendered nodes to root
		if (result !== null) {
			if (Array.isArray(result)) {
				for (const node of result) {
					root.appendChild(node);
				}
			} else {
				root.appendChild(result as Node);
			}
		}

		// AC27: Return cleanup handle
		// Track if already unmounted for idempotency
		let unmounted = false;

		return {
			unmount: () =>
				Effect.gen(function* () {
					// AC27: Make unmount idempotent
					if (unmounted) {
						return;
					}
					unmounted = true;

					// AC26: Close scope to cancel all running streams
					// All fibers forked with Effect.forkIn will be automatically interrupted
					yield* Scope.close(scope, Exit.void);

					// AC26: Dispose the ManagedRuntime
					// ManagedRuntime.dispose returns a Promise, so we need to wrap it
					yield* Effect.promise(() => runtime.dispose());
				}),
		};
	});
}
