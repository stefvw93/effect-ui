import { Context, type ManagedRuntime, type Scope } from "effect";

/**
 * Service for managing rendering context including runtime, scope, and stream IDs
 */
export class RenderContext extends Context.Tag("RenderContext")<
	RenderContext,
	{
		readonly runtime: ManagedRuntime.ManagedRuntime<never, never>;
		readonly scope: Scope.Scope;
		readonly streamIdCounter: { current: number };
	}
>() {}
