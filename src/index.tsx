import { Context, Effect, Layer, ManagedRuntime } from "effect";
import type { JSXNode } from "~/jsx-runtime";

interface EffectUIRuntimeImpl {
	readonly environment: "client" | "server";
}

class EffectUIRuntime extends Context.Tag("effect-ui/UIContext")<
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

// USER LAND

export function main() {
	const result = render(<div id={Effect.succeed("")}>Hello</div>, {
		environment: "client",
	});
	console.log(result);
}
