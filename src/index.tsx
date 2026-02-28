import { Context, Effect, Layer, ManagedRuntime } from "effect";
import type { JSXNode } from "@/jsx-runtime";

// ============================================================================
// Core Runtime
// ============================================================================

export interface EffectUIRuntimeImpl {
	readonly environment: "client" | "server";
}

export class EffectUIRuntime extends Context.Tag("effect-ui/UIContext")<
	EffectUIRuntime,
	EffectUIRuntimeImpl
>() {}

function render(app: JSXNode, config: EffectUIRuntimeImpl) {
	const appLayer = Layer.succeed(EffectUIRuntime, config);
	const runtime = ManagedRuntime.make(appLayer);
	const result = runtime.runSync(Effect.succeed(app));
	Effect.runFork(runtime.disposeEffect);
	return result;
}

// ============================================================================
// Client-Side Exports
// ============================================================================

export type { MountHandle } from "@/dom";
export { mount } from "@/dom";

// ============================================================================
// Server-Side Exports
// ============================================================================

export type {
	HydrationManifest,
	HydrationMetadata,
	HydrationOptions,
	HydrationPriority,
	SSROptions,
} from "@/ssr";
export {
	ClientOnly,
	hydrate,
	isClient,
	isServer,
	renderToStream,
	renderToString,
	ServerOnly,
} from "@/ssr";

// ============================================================================
// Shared Exports
// ============================================================================

export {
	AsyncComponentError,
	InvalidElementType,
	RenderError,
	SSRRenderError,
	StreamSubscriptionError,
} from "@/shared/errors";

// ============================================================================
// JSX Runtime (re-export for convenience)
// ============================================================================

export type { JSXNode, JSXType, PropsWithChildren } from "@/jsx-runtime";
export { Fragment, jsx, jsxs } from "@/jsx-runtime";
