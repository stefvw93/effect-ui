# Declarative DOM Event Handlers

## Overview

This recipe demonstrates how to use event handlers in effect-ui. Handlers follow the same reactive pattern as other props - they can be static, Stream-based, or Effect-based.

## Problem

Traditional event handlers are limited to plain callbacks. When building Effect-based applications, you often want handlers to:
- Run Effects (async operations, logging, etc.)
- Access services provided at mount time
- Change dynamically based on application state

## Solution

effect-ui event handlers support three patterns:

```typescript
// 1. Plain callback (sync)
<button onclick={() => console.log("clicked")} />

// 2. Effect-returning callback (async, with services)
<button onclick={() => Effect.gen(function* () {
  const analytics = yield* Analytics;
  yield* analytics.track("click");
})} />

// 3. Reactive handler (changes over time)
<button onclick={handlerStream} />
```

## How It Works

1. Event props (starting with "on" + lowercase letter) are detected during rendering
2. Static handlers are attached directly via `addEventListener`
3. Effect-returning handlers are detected at runtime and run via `runFork`
4. Stream/Effect-wrapped handlers are subscribed to, updating the listener on each emission
5. Services provided via `Effect.provide()` at mount are accessible in handlers

## Benefits

- **Unified patterns**: Handlers follow the same `AttributeValue` pattern as other props
- **Service access**: Use dependency injection in event handlers
- **Error resilience**: Effect errors are logged, UI stays responsive
- **Reactive**: Handlers can change dynamically via Streams
- **Type-safe**: Full TypeScript support for event types

## Usage Patterns

### Plain Callback
```typescript
<button onclick={() => { count++; }} />
```

### Effect Handler
```typescript
<button onclick={() => Effect.log("clicked")} />
```

### Handler with Services
```typescript
<button onclick={() => Effect.gen(function* () {
  const db = yield* Database;
  yield* db.save({ action: "click" });
})} />

// At mount:
mount(<App />, root).pipe(Effect.provide(DatabaseLive))
```

### Conditional Handler
```typescript
<button onclick={isEnabled ? handler : null} />
```

### Reactive Handler
```typescript
const handlerStream = Stream.make(handlerA, handlerB);
<button onclick={handlerStream} />
```

## When to Use

- When handlers need to perform async operations
- When handlers need access to app-wide services
- When handler behavior should change based on state
- When you want consistent Effect patterns throughout your app
