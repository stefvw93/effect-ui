# Effect UI

[![CI + Release](https://github.com/stefvw93/effect-ui/actions/workflows/ci-release.yml/badge.svg)](https://github.com/stefvw93/effect-ui/actions/workflows/ci-release.yml)

A reactive DOM rendering library built on [Effect](https://effect.website) that enables declarative UI with streams and automatic updates.

## Features

- 🎯 **Effect-first**: Built entirely on Effect's powerful abstractions
- 🌊 **Reactive Streams**: First-class support for Effect streams in JSX
- ⚡ **Automatic Updates**: DOM automatically subscribes to streams and updates
- 🎨 **Dynamic Styles**: Stream-based style updates with full TypeScript support
- 📦 **Zero Virtual DOM**: Direct DOM manipulation with reactive bindings
- 🔧 **Type-Safe**: Full TypeScript support including streams in JSX props

## Requirements

- Node.js ≥ 24.7.0
- pnpm ≥ 10.28.0

## Quick Start

Install from latest release, then:

```tsx
import { Effect, Stream, Schedule } from "effect";
import { mount } from "effect-ui";

// Create a reactive counter
const counter = Stream.iterate(0, n => n + 1).pipe(
  Stream.schedule(Schedule.spaced(1000))
);

// Mount reactive UI
const app = (
  <div>
    <h1>Count: {counter}</h1>
  </div>
);

Effect.runPromise(mount(app, document.getElementById("root")!));
```

## Examples

### Reactive State (Signals)

```tsx
import { Effect, Stream, SubscriptionRef } from "effect";

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

### Async Data Loading

```tsx
const UserProfile = ({ id }: { id: number }) =>
  Stream.concat(
    Stream.make(<div>Loading...</div>),
    Stream.fromEffect(
      Effect.gen(function* () {
        const user = yield* fetchUser(id);
        return <div>{user.name}</div>;
      })
    )
  );
```

### Effect Event Handlers

```tsx
const SaveButton = () => (
  <button
    onclick={() =>
      Effect.gen(function* () {
        yield* Effect.log("Saving...");
        yield* saveData();
        yield* Effect.log("Done!");
      })
    }
  >
    Save
  </button>
);
```

### Derived Streams

```tsx
const count = yield* SubscriptionRef.make(0);

const doubled = Stream.map(count.changes, n => n * 2);
const isEven = Stream.map(count.changes, n => n % 2 === 0 ? "Yes" : "No");

return (
  <div>
    <p>Count: {count.changes}</p>
    <p>Doubled: {doubled}</p>
    <p>Even: {isEven}</p>
  </div>
);
```

## Interactive Playground

The project includes a Vite-powered playground with interactive examples demonstrating Effect UI's capabilities.

### Running the Playground

```bash
pnpm dev
```

Open http://localhost:3000 in your browser to see:

- **Auto-incrementing Counter** - Stream-based counter updating every second
- **Dynamic Styles** - Animated colors and sizes using streams
- **Status Indicator** - Effect delays simulating async operations
- **Live Clock** - Real-time clock using scheduled streams
- **Random Numbers** - Stream-generated random values
- **Streaming List** - Progressive list building with streams
- **Mixed Content** - Static and dynamic content combined

### Playground Features

The playground demonstrates:
- Reactive DOM updates without manual subscriptions
- Stream transformations and scheduling
- Effect-based async operations
- Dynamic style properties with streams
- Type-safe JSX with full stream support

## Core Concepts

### Streams as Children

JSX elements can directly render streams:

```tsx
const message = Stream.make("Loading...", "Ready!");
<div>{message}</div>
```

### Stream Properties

Any prop can be a stream for reactive updates:

```tsx
const color = Stream.iterate(["red", "blue", "green"], colors =>
  colors.slice(1).concat(colors[0])
).pipe(Stream.schedule(Schedule.spaced(1000)));

<div style={{ color }}>Changing colors!</div>
```

### Style Streams

Styles support multiple stream patterns:

```tsx
// Stream individual properties
<div style={{ width: widthStream, height: "100px" }} />

// Stream entire style string
<div style={Stream.make("color: red", "color: blue")} />

// Stream style object
<div style={Stream.make({ color: "red" }, { color: "blue" })} />
```

## Scripts

- `pnpm dev` - Start the interactive playground
- `pnpm build` - Build the project using tsdown
- `pnpm test` - Run tests with Node.js native test runner
- `pnpm test.watch` - Run tests in watch mode
- `pnpm lint` - Check code with Biome
- `pnpm lint.fix` - Fix linting issues automatically
- `pnpm typecheck` - Run TypeScript type checking

## Architecture

### DOM Rendering

Effect UI uses direct DOM manipulation with reactive bindings:
- Comment markers track stream children locations
- ManagedRuntime handles subscriptions per mount
- Automatic cleanup on stream completion

### JSX Runtime

Custom JSX runtime with:
- Support for classic transform (esbuild/Vite)
- Fragment support
- Full type safety for streams in props and children

### Type System

Comprehensive TypeScript definitions:
- Stream-compatible attributes for all HTML elements
- Style prop supporting strings, objects, and streams
- Effect and Stream types integrated into JSX

## Tech Stack

- **Effect** - Functional programming foundation
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast development server with HMR
- **esbuild** - Lightning-fast JSX transformation
- **tsdown** - Fast TypeScript bundler
- **Biome** - Fast linter and formatter
- **Node.js test runner** - Native testing with tsx loader
- **JSDOM** - DOM testing environment

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Start playground
pnpm dev

# Type check
pnpm typecheck

# Lint and fix
pnpm lint.fix
```

## License

ISC
