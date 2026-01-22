# Declarative DOM Event Handlers Specification

## Overview

Implement declarative event handlers for effect-ui that follow the same `AttributeValue<T>` pattern as other props. Handlers can be plain callbacks OR return Effects, with service access through the existing `Effect.provide()` pattern.

## Purpose

Enable declarative event handling in JSX where handlers can optionally return Effects that are automatically run with access to services provided during mount.

## Acceptance Criteria

### AC1: Static Plain Callback Handler
- **Given** an element with a static event handler `<button onclick={(e) => count++}>`
- **When** the event fires
- **Then** the callback is invoked synchronously with the event object

### AC2: Static Effect Handler
- **Given** an element with an Effect-returning handler `<button onclick={(e) => Effect.log("clicked")}>`
- **When** the event fires
- **Then** the Effect is detected and run via the mount runtime

### AC3: Effect Handler with Services
- **Given** an element with a handler that uses services `<button onclick={() => ServiceA.doSomething()}>`
- **And** services provided via `mount(app, root).pipe(Effect.provide(ServiceALayer))`
- **When** the event fires
- **Then** the handler Effect can access the provided services

### AC4: Effect Handler Error Handling
- **Given** an element with a handler that returns a failing Effect
- **When** the event fires
- **Then** the error is logged and the UI stays responsive (no crash)

### AC5: Reactive Handler (Stream)
- **Given** an element with a Stream-based handler `onclick={handlerStream}`
- **When** the stream emits a new handler function
- **Then** the old listener is removed and the new listener is attached

### AC6: Reactive Handler (Effect)
- **Given** an element with an Effect-based handler `onclick={Effect.succeed(handler)}`
- **When** the Effect resolves
- **Then** the resolved handler is attached as the listener

### AC7: Null/False Handler Values
- **Given** an element with handler set to `null` or `false`
- **When** rendering
- **Then** no event listener is attached

### AC8: Handler Change Cleanup
- **Given** an element with a reactive handler stream
- **When** a new handler is emitted
- **Then** the previous listener is removed before the new one is attached

### AC9: Cleanup on Unmount
- **Given** an element with event handlers (static or reactive)
- **When** unmount is called
- **Then** all event listeners are removed and no handlers fire after unmount

### AC10: Event Handler Detection
- **Given** a prop name
- **When** checking if it's an event handler
- **Then** props starting with "on" followed by a lowercase letter are treated as event handlers (onclick, onchange, etc.)

## Technical Requirements

### Type Signatures

```ts
// Handler function can return void or Effect
type EventHandlerFn<T, E extends Event> = (
  e: E & { currentTarget: T; target: Element }
) => void | Effect.Effect<void, unknown, unknown>;

// Full handler value following AttributeValue pattern
type EventHandler<T, E extends Event> =
  | EventHandlerFn<T, E>
  | Stream.Stream<EventHandlerFn<T, E> | null | false>
  | Effect.Effect<EventHandlerFn<T, E> | null | false>;
```

### Error Handling Strategy
- Effect-returning handlers that fail have their errors logged
- The UI continues to function (catch and log, don't crash)
- Use `Effect.catchAll` with `Effect.logError` for error reporting

### Runtime Context
- The mount function captures the Effect context at mount time
- Event handlers run with access to this captured context
- Services provided via `Effect.provide()` are accessible in handlers

## Constraints

- Event handlers must not block the main thread
- Effect-returning handlers run asynchronously via `runFork`
- Handler detection uses simple string prefix matching ("on" + lowercase)
