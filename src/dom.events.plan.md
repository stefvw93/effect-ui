# Declarative DOM Event Handlers using Effect

## Overview

Implement declarative event handlers for effect-ui that follow the same `AttributeValue<T>` pattern as other props. Handlers can be plain callbacks OR return Effects, with service access through the existing `Effect.provide()` pattern.

## Design Decisions

Based on user requirements:
- **Handler returns**: Both `void` and `Effect<void>` supported - detected at runtime
- **Service access**: Handlers access services via `Effect.provide(layer)` on mount (same as Streams)
- **Reactive handlers**: Fully supported via `Stream<Handler>`, `Effect<Handler>`, or static
- **Error handling**: Log and continue (UI stays responsive)
- **No public API changes**: Mount signature stays the same

## Files to Modify

1. `src/jsx-runtime/types/dom.ts` - Update handler type signatures
2. `src/dom.ts` - Add event handler logic to prop handling
3. `src/api.ts` - Capture Effect context and use it for runtime creation

## Implementation Steps

### Step 1: Update Type Definitions (`src/jsx-runtime/types/dom.ts`)

Update `EventHandler` to support Effect-returning handlers:

```ts
import type { Effect, Stream } from "effect";

// Handler can return void OR an Effect (any error/service types allowed)
export type EventHandler<T, E extends Event> = (
  e: E & { currentTarget: T; target: Element },
) => void | Effect.Effect<void, unknown, unknown>;

// Following AttributeValue pattern: static | Stream | Effect
export type EventHandlerValue<T, E extends Event> =
  | null
  | false
  | EventHandler<T, E>
  | Stream.Stream<EventHandler<T, E> | null | false>
  | Effect.Effect<EventHandler<T, E> | null | false>;
```

Update `DOMAttributes` to use `EventHandlerValue`:

```ts
export interface DOMAttributes<T> {
  onclick?: EventHandlerValue<T, MouseEvent>;
  onchange?: EventHandlerValue<T, Event>;
  // ... etc for all events
}
```

This follows the same pattern as `AttributeValue<T>` from `values.ts`, making handlers reactive-capable just like other props.

### Step 2: Add Event Handler Logic (`src/dom.ts`)

Add to `setElementProps` - detect event props (start with "on") and route to new `setEventHandler`:

```ts
// In setElementProps loop:
if (isEventHandler(key)) {
  yield* setEventHandler(element, key, value);
  continue;
}
```

Implement `isEventHandler` and `setEventHandler`:

```ts
function isEventHandler(name: string): boolean {
  return name.startsWith("on") && name.length > 2;
}

function setEventHandler(
  element: HTMLElement,
  name: string,
  value: unknown,
): Effect.Effect<void, StreamSubscriptionError, RenderContext> {
  // Extract event name: "onclick" -> "click"
  const eventName = name.slice(2).toLowerCase();

  // Create wrapper that handles both plain and Effect-returning handlers
  const createListener = (handler: Function) => (event: Event) => {
    const result = handler(event);
    if (Effect.isEffect(result)) {
      // Run with runtime from context, catch errors and log
      context.runtime.runFork(
        pipe(
          result,
          Effect.catchAll((error) =>
            Effect.logError(`Event handler error in ${name}`, error)
          )
        )
      );
    }
  };

  // Handle static vs reactive (Stream/Effect) handlers
  // Track current listener for removal when handler changes
}
```

### Step 3: Update Mount to Capture Context (`src/api.ts`)

Capture the Effect context during mount and create runtime with it:

```ts
export function mount(
  app: JSXChild,
  root: HTMLElement,
): Effect.Effect<
  MountHandle,
  InvalidElementTypeError | StreamSubscriptionError | RenderError
> {
  return Effect.gen(function* () {
    // Capture current Effect context (includes any provided services)
    const context = yield* Effect.context<never>();

    // Create runtime with captured context as a layer
    // This allows event handlers to access services provided via Effect.provide()
    const runtime = ManagedRuntime.make(Layer.succeedContext(context));

    // ... rest of mount
  });
}
```

This maintains the existing API - users keep doing:
```ts
mount(<App />, root).pipe(Effect.provide(MyServiceLayer))
```

And event handlers can access services the same way Streams already do.

## Detailed Implementation for `setEventHandler`

```ts
function setEventHandler(
  element: HTMLElement,
  name: string,
  value: unknown,
): Effect.Effect<void, StreamSubscriptionError, RenderContext> {
  return Effect.gen(function* () {
    const context = yield* RenderContext;
    const eventName = name.slice(2).toLowerCase();

    // Track current listener for cleanup
    let currentListener: ((e: Event) => void) | null = null;

    const removeListener = () => {
      if (currentListener) {
        element.removeEventListener(eventName, currentListener);
        currentListener = null;
      }
    };

    const attachListener = (handler: unknown) => {
      // Remove previous listener if any
      removeListener();

      // null/false/undefined = no handler
      if (handler == null || handler === false) {
        return;
      }

      if (typeof handler !== "function") {
        return; // Invalid handler, ignore
      }

      // Create wrapper that detects Effect return values
      currentListener = (event: Event) => {
        const result = handler(event);
        if (Effect.isEffect(result)) {
          context.runtime.runFork(
            pipe(
              result,
              Effect.catchAll((error) =>
                Effect.logError(`Event handler error: ${name}`, { error })
              )
            )
          );
        }
      };

      element.addEventListener(eventName, currentListener);
    };

    // Register cleanup finalizer with scope
    yield* Scope.addFinalizer(context.scope, Effect.sync(removeListener));

    // Handle static vs reactive handlers
    if (isStream(value) || Effect.isEffect(value)) {
      const stream = normalizeToStream(value);
      yield* subscribeToStream(
        stream,
        (handler) => attachListener(handler),
        `event:${name}`,
      );
    } else {
      // Static handler
      attachListener(value);
    }
  });
}
```

**Cleanup notes:**
- Static handlers: Cleaned up via scope finalizer when unmount is called
- Reactive handlers: Stream subscription cancels on scope close, finalizer removes last listener
- All listeners properly removed on unmount

## Test Plan

Create `src/dom.events.test.tsx` with tests for:

1. **Static plain callback**: `<button onclick={(e) => count++}>` - fires synchronously
2. **Static Effect handler**: `<button onclick={(e) => Effect.log("clicked")}>` - runs Effect
3. **Effect handler with services**: Handler accesses service from mount Layer
4. **Effect handler error**: Returns failing Effect - should log, not crash
5. **Reactive handler (Stream)**: `onclick={handlerStream}` - updates when stream emits
6. **Reactive handler (Effect)**: `onclick={Effect.succeed(handler)}` - resolves to handler
7. **null/false handlers**: No listener attached
8. **Handler change**: Old listener removed, new listener added
9. **Cleanup on unmount**: Listeners removed when scope closes

## Specs File

Create `src/dom.events.specs.md` with acceptance criteria following the existing spec format.

## Verification

1. Run `pnpm test` - all tests pass
2. Run `pnpm typecheck` - no type errors
3. Run `pnpm lint` - no lint errors
4. Manual test in playground with both plain and Effect handlers
