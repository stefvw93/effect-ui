# Effect UI

[![CI + Release](https://github.com/stefvw93/effect-ui/actions/workflows/ci-release.yml/badge.svg)](https://github.com/stefvw93/effect-ui/actions/workflows/ci-release.yml)

> Production-grade frontend development with [Effect](https://effect.website)

## Why effect-ui?

Frontend at scale is hard. Real applications need robust API orchestration, error handling, retries, telemetry, and observability. [Effect](https://effect.website) solves these problems elegantly on the backend; effect-ui brings the same patterns to the browser.

effect-ui is a reactive DOM rendering library that makes Effect and Stream first-class JSX citizens. Components run once, and streams drive all updates. No virtual DOM, no diffing: just direct DOM manipulation with reactive bindings.

> **Early Development Notice**: effect-ui is in active early development. APIs may change rapidly. Not recommended for production use yet.

## Features

- **Effect-first architecture**: Services, Layers, and dependency injection in the browser
- **Reactive primitives**: Effect and Stream as first-class JSX citizens
- **Ephemeral components**: Components run once, streams drive updates
- **Full TypeScript support**: Type-safe JSX with streams in props and children

## Installation

Install from [GitHub releases](https://github.com/stefvw93/effect-ui/releases) (not yet published to package registries).

Configure TypeScript for effect-ui's JSX runtime:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "effect-ui"
  }
}
```

**New to Effect?** Check out the [Effect documentation](https://effect.website/docs/getting-started/introduction) to learn the fundamentals.

## Examples

### API Call with Error Handling and Retry

Effect's retry and error handling patterns work directly in your UI:

```tsx
import { Effect, Stream, Schedule } from "effect";
import { mount } from "effect-ui";

const fetchUser = (id: number) =>
  Effect.tryPromise({
    try: () => fetch(`/api/users/${id}`).then(r => r.json()),
    catch: () => new Error("Failed to fetch user"),
  });

const UserProfile = ({ id }: { id: number }) =>
  Stream.concat(
    Stream.make(<div>Loading...</div>),
    Stream.fromEffect(
      fetchUser(id).pipe(
        Effect.retry(Schedule.exponential("100 millis").pipe(Schedule.compose(Schedule.recurs(3)))),
        Effect.map(user => <div>{user.name}</div>),
        Effect.catchAll(() => Effect.succeed(<div>Failed to load user</div>))
      )
    )
  );

Effect.runPromise(mount(<UserProfile id={1} />, document.getElementById("root")!));
```

### Event Handler with Logging

Effect handlers enable telemetry, logging, and observability:

```tsx
import { Effect } from "effect";

const saveData = (data: FormData) =>
  Effect.gen(function* () {
    yield* Effect.log("Save initiated", { timestamp: Date.now() });
    yield* Effect.tryPromise(() => fetch("/api/save", { method: "POST", body: data }));
    yield* Effect.log("Save completed");
  });

const SaveButton = ({ data }: { data: FormData }) => (
  <button
    onclick={() =>
      saveData(data).pipe(
        Effect.tap(() => Effect.log("User clicked save")),
        Effect.catchAll(error => Effect.log("Save failed", { error }))
      )
    }
  >
    Save
  </button>
);
```

### Reactive State with SubscriptionRef

SubscriptionRef provides reactive state with automatic stream-based updates:

```tsx
import { Effect, SubscriptionRef } from "effect";

const Counter = () =>
  Effect.gen(function* () {
    const count = yield* SubscriptionRef.make(0);

    return (
      <div>
        <span>{count.changes}</span>
        <button onclick={() => SubscriptionRef.update(count, n => n + 1)}>+</button>
        <button onclick={() => SubscriptionRef.update(count, n => n - 1)}>-</button>
      </div>
    );
  });
```

### Derived Streams

Transform reactive values with standard Stream operations:

```tsx
import { Effect, Stream, SubscriptionRef } from "effect";

const Dashboard = () =>
  Effect.gen(function* () {
    const count = yield* SubscriptionRef.make(0);

    const doubled = Stream.map(count.changes, n => n * 2);
    const status = Stream.map(count.changes, n => (n > 10 ? "High" : "Normal"));

    return (
      <div>
        <p>Count: {count.changes}</p>
        <p>Doubled: {doubled}</p>
        <p>Status: {status}</p>
        <button onclick={() => SubscriptionRef.update(count, n => n + 1)}>Increment</button>
      </div>
    );
  });
```

## Core Concepts

**Streams as children**: JSX elements render streams directly; each emitted value replaces the previous:

```tsx
const message = Stream.make("Loading...", "Ready!");
<div>{message}</div>
```

**Stream properties**: Any prop can be a stream for reactive updates:

```tsx
const isDisabled = Stream.make(true, false);
<button disabled={isDisabled}>Submit</button>
```

**Stream styles**: Styles support streams at any level:

```tsx
<div style={{ color: colorStream, width: "100px" }} />
<div style={Stream.make({ color: "red" }, { color: "blue" })} />
```

## Playground

Run `pnpm dev` to start an interactive playground with examples at http://localhost:3000.

## Development

```bash
pnpm install     # Install dependencies
pnpm dev         # Start playground
pnpm test        # Run tests
pnpm typecheck   # Type check
pnpm lint.fix    # Lint and fix
```

## License

ISC
