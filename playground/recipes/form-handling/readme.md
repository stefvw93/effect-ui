# Form Handling

## Overview

This recipe demonstrates reactive form handling with stream-based inputs, validation, and Effect-powered submit handlers.

## Problem

Form handling in web apps requires managing input state, validation, and async submission. Traditional approaches use controlled components with useState, leading to verbose code and prop drilling.

## Solution

effect-ui enables reactive form patterns using streams:

```typescript
// Create an emitter for form values
const [valueStream, setValue] = createEmitter("");

// Input updates the stream
<input oninput={(e) => setValue(e.target.value)} />

// Derived streams for validation
const validationStream = Stream.map(valueStream, validate);

// Display reactive feedback
<span>{validationStream}</span>
```

## How It Works

1. `createEmitter` creates a stream and an emit function
2. Input events call the emit function with new values
3. Derived streams compute validation, character counts, etc.
4. UI reacts to stream changes automatically
5. Form submit handlers can return Effects for async operations

## Benefits

- **Reactive by design**: No manual state synchronization
- **Derived state**: Compute validations declaratively
- **Effect integration**: Submit handlers with async operations
- **Type-safe**: Full TypeScript support
- **Composable**: Combine streams for complex validation logic

## Usage Patterns

### Basic Emitter Pattern
```typescript
function createEmitter<T>(initial: T) {
  let listener: ((value: T) => void) | null = null;

  const stream = Stream.async<T>((emit) => {
    emit.single(initial);
    listener = (value) => emit.single(value);
    return Effect.sync(() => { listener = null; });
  });

  const emit = (value: T) => listener?.(value);
  return [stream, emit] as const;
}
```

### Validation Stream
```typescript
const [emailStream, setEmail] = createEmitter("");

const validationStream = Stream.map(emailStream, (email) => {
  if (!email.includes("@")) return "Invalid email";
  return null;
});

<input oninput={(e) => setEmail(e.target.value)} />
<span class="error">{validationStream}</span>
```

### Character Counter
```typescript
const [textStream, setText] = createEmitter("");
const countStream = Stream.map(textStream, (t) => t.length);
const remainingStream = Stream.map(countStream, (c) => 100 - c);

<textarea oninput={(e) => setText(e.target.value)} />
<span>{remainingStream} characters remaining</span>
```

### Effect Submit Handler
```typescript
<form onsubmit={(e) => {
  e.preventDefault();
  return Effect.gen(function* () {
    yield* Effect.log("Submitting...");
    yield* submitForm();
    yield* Effect.log("Done!");
  });
}}>
```

## When to Use

- Forms with real-time validation feedback
- Character counters and input constraints
- Live search with preview
- Multi-step forms with progress tracking
- Any form that benefits from reactive state
