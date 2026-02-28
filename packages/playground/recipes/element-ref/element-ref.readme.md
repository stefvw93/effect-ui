# Element Ref

## Overview

This recipe demonstrates using Effect's `Ref` and `SubscriptionRef` to get direct references to DOM elements after they are mounted. Element refs enable imperative DOM operations like focusing inputs, measuring dimensions, drawing on canvas, or triggering scroll behavior.

## Problem

Sometimes you need direct access to a DOM element to perform operations that can't be expressed declaratively:

- Focusing an input element programmatically
- Measuring element dimensions with `getBoundingClientRect()`
- Drawing on a `<canvas>` element
- Scrolling an element into view
- Integrating with third-party libraries that require DOM nodes

React-style refs solve this by providing a mutable container, but Effect provides a more powerful pattern using `Ref` and `SubscriptionRef`.

## Solution

Use `SubscriptionRef<Option<HTMLElement>>` to hold an optional reference to the DOM element:

```typescript
const AutoFocusInput = () =>
  Effect.gen(function* () {
    const inputRef = yield* SubscriptionRef.make<Option.Option<HTMLInputElement>>(
      Option.none()
    );

    // Subscribe to ref changes and focus when element is mounted
    yield* pipe(
      inputRef.changes,
      Stream.filter(Option.isSome),
      Stream.take(1),
      Stream.runForEach((option) =>
        Effect.sync(() => {
          const element = Option.getOrThrow(option);
          element.focus();
        })
      ),
      Effect.fork
    );

    return <input ref={inputRef} type="text" />;
  });
```

## How It Works

1. **Create the ref**: `SubscriptionRef.make<Option.Option<HTMLElement>>(Option.none())` creates a ref initialized to `Option.none()`

2. **Attach to element**: The `ref` prop accepts a `Ref` or `SubscriptionRef`. When the element is created, the ref is set to `Option.some(element)`

3. **React to mount**: Using `SubscriptionRef`, you can subscribe to `.changes` and react when the element becomes available

4. **Type safety**: The element type is preserved - `Ref<Option<HTMLInputElement>>` ensures you get an `HTMLInputElement` with all its properties

5. **Single emission**: The ref is set exactly once during element creation

## When to Use

Use element refs when you need to:

- **Focus management**: Auto-focus inputs, manage focus traps in modals
- **Measurements**: Get element dimensions, positions, or scroll offsets
- **Canvas/WebGL**: Access canvas context for drawing operations
- **Scroll control**: Scroll elements into view, implement virtual scrolling
- **Third-party integrations**: Pass DOM nodes to libraries like D3, Chart.js, or video players
- **Form handling**: Access input values directly, trigger form submissions

## Usage Patterns

### Auto-focus on Mount

```typescript
const AutoFocus = () =>
  Effect.gen(function* () {
    const ref = yield* SubscriptionRef.make<Option.Option<HTMLInputElement>>(
      Option.none()
    );

    yield* pipe(
      ref.changes,
      Stream.filter(Option.isSome),
      Stream.take(1),
      Stream.runForEach((opt) =>
        Effect.sync(() => Option.getOrThrow(opt).focus())
      ),
      Effect.fork
    );

    return <input ref={ref} />;
  });
```

### Measure Dimensions

```typescript
const Measure = () =>
  Effect.gen(function* () {
    const ref = yield* SubscriptionRef.make<Option.Option<HTMLDivElement>>(
      Option.none()
    );
    const size = yield* SubscriptionRef.make("...");

    yield* pipe(
      ref.changes,
      Stream.filter(Option.isSome),
      Stream.take(1),
      Stream.runForEach((opt) =>
        Effect.gen(function* () {
          const rect = Option.getOrThrow(opt).getBoundingClientRect();
          yield* SubscriptionRef.set(size, `${rect.width}x${rect.height}`);
        })
      ),
      Effect.fork
    );

    return (
      <div>
        <div ref={ref} style={{ width: "200px", height: "100px" }}>Box</div>
        <p>Size: {size.changes}</p>
      </div>
    );
  });
```

### Imperative Actions via Button

```typescript
const ScrollToElement = () =>
  Effect.gen(function* () {
    const targetRef = yield* SubscriptionRef.make<Option.Option<HTMLDivElement>>(
      Option.none()
    );

    const scrollTo = () =>
      Effect.gen(function* () {
        const opt = yield* SubscriptionRef.get(targetRef);
        if (Option.isSome(opt)) {
          Option.getOrThrow(opt).scrollIntoView({ behavior: "smooth" });
        }
      });

    return (
      <div>
        <button onclick={() => scrollTo()}>Scroll to Target</button>
        <div ref={targetRef}>Target Element</div>
      </div>
    );
  });
```

### Canvas Drawing

```typescript
const CanvasExample = () =>
  Effect.gen(function* () {
    const canvasRef = yield* SubscriptionRef.make<Option.Option<HTMLCanvasElement>>(
      Option.none()
    );

    yield* pipe(
      canvasRef.changes,
      Stream.filter(Option.isSome),
      Stream.take(1),
      Stream.runForEach((opt) =>
        Effect.sync(() => {
          const ctx = Option.getOrThrow(opt).getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#000";
            ctx.fillRect(10, 10, 50, 50);
          }
        })
      ),
      Effect.fork
    );

    return <canvas ref={canvasRef} width={200} height={100} />;
  });
```

## Comparison with React Refs

| React | Effect UI |
|-------|-----------|
| `useRef<HTMLElement>(null)` | `SubscriptionRef.make<Option.Option<HTMLElement>>(Option.none())` |
| `ref.current` (nullable) | `Ref.get(ref)` returns `Option` |
| `useEffect(() => { if (ref.current) ... })` | `Stream.filter(Option.isSome)` on `.changes` |
| Manual null checks | Type-safe `Option` operations |

## Notes

- Refs are set once during element creation and are not cleared on unmount
- Use `SubscriptionRef` when you need to react to the element becoming available
- Use regular `Ref` when you only need to read the element imperatively later
- The `Option` wrapper correctly handles the "not yet mounted" state
