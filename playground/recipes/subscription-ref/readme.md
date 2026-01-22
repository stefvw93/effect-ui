# SubscriptionRef (Reactive Signals)

## Overview

This recipe demonstrates using Effect's SubscriptionRef as a reactive state primitive, similar to signals in SolidJS or stores in Svelte.

## Problem

Reactive state management typically requires external libraries (Redux, MobX, Zustand) or framework-specific solutions. Effect provides SubscriptionRef as a built-in reactive primitive that integrates naturally with the Effect ecosystem.

## Solution

SubscriptionRef provides a mutable reference with a `.changes` stream:

```typescript
const Counter = () =>
  Effect.gen(function* () {
    const count = yield* SubscriptionRef.make(0);

    const increment = () =>
      SubscriptionRef.update(count, n => n + 1);

    return (
      <div>
        <span>{count.changes}</span>
        <button onclick={() => increment()}>+</button>
      </div>
    );
  });
```

## How It Works

1. `SubscriptionRef.make(initial)` creates a ref with initial value
2. `.changes` is a Stream that emits the current value and all future updates
3. `SubscriptionRef.set(ref, value)` sets a new value
4. `SubscriptionRef.update(ref, fn)` updates based on current value
5. Derived streams use `Stream.map` on `.changes`

## Benefits

- **Effect-native**: Built into Effect, no external dependencies
- **Type-safe**: Full TypeScript support for state shape
- **Composable**: Combine refs with Stream operators
- **Efficient**: Only subscribers receive updates
- **Familiar**: Similar mental model to SolidJS signals

## Usage Patterns

### Basic Counter
```typescript
const count = yield* SubscriptionRef.make(0);

// Display current value
<span>{count.changes}</span>

// Update
onclick={() => SubscriptionRef.update(count, n => n + 1)}
```

### Derived State
```typescript
const count = yield* SubscriptionRef.make(0);
const doubled = Stream.map(count.changes, n => n * 2);
const isEven = Stream.map(count.changes, n => n % 2 === 0);

<span>Doubled: {doubled}</span>
<span>Even: {isEven}</span>
```

### Object State
```typescript
const form = yield* SubscriptionRef.make({ name: "", email: "" });

const updateName = (name: string) =>
  SubscriptionRef.update(form, state => ({ ...state, name }));

<input oninput={(e) => updateName(e.target.value)} />
<pre>{Stream.map(form.changes, JSON.stringify)}</pre>
```

### Combining Multiple Refs
```typescript
const firstName = yield* SubscriptionRef.make("");
const lastName = yield* SubscriptionRef.make("");

const fullName = Stream.zipLatestWith(
  firstName.changes,
  lastName.changes,
  (first, last) => `${first} ${last}`.trim()
);

<span>Full name: {fullName}</span>
```

### Array State
```typescript
const todos = yield* SubscriptionRef.make<Todo[]>([]);

const addTodo = (text: string) =>
  SubscriptionRef.update(todos, list => [
    ...list,
    { id: Date.now(), text, done: false }
  ]);

const toggleTodo = (id: number) =>
  SubscriptionRef.update(todos, list =>
    list.map(t => t.id === id ? { ...t, done: !t.done } : t)
  );
```

## Comparison with SolidJS Signals

| SolidJS | Effect SubscriptionRef |
|---------|----------------------|
| `createSignal(0)` | `SubscriptionRef.make(0)` |
| `count()` | `count.changes` (stream) |
| `setCount(5)` | `SubscriptionRef.set(count, 5)` |
| `setCount(n => n + 1)` | `SubscriptionRef.update(count, n => n + 1)` |
| `createMemo(() => count() * 2)` | `Stream.map(count.changes, n => n * 2)` |

## When to Use

- Component-local state that needs to be reactive
- Form state with validation
- Lists/arrays that change over time
- Any state shared between event handlers and rendering
- When you want Effect integration in state management
