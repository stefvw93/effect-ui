# Reactive Styles

## Overview

This recipe demonstrates how to use streams for dynamic styling in effect-ui. Styles can be static strings, objects with stream properties, or entire style streams for complete style replacement.

## Problem

Traditional React-style apps require state management and re-renders for style changes. CSS animations work for simple cases, but complex dynamic styles often need JavaScript control.

## Solution

effect-ui supports reactive styles through streams:

```typescript
// Individual property as stream
<div style={{
  backgroundColor: colorStream,
  width: widthStream,
}} />

// Entire style object as stream
<div style={styleObjectStream} />

// Mixed static and reactive
<div style={{
  ...reactiveStyles,
  transition: "all 0.3s",  // static
}} />
```

## How It Works

1. Style props accept the same `AttributeValue` pattern as other attributes
2. Individual CSS properties can be streams that emit new values
3. Entire style objects can be streams for coordinated changes
4. CSS transitions work naturally with stream updates
5. Multiple style streams on one element are subscribed independently

## Benefits

- **Fine-grained control**: Animate individual properties independently
- **CSS transitions**: Works seamlessly with CSS transition properties
- **Coordinated changes**: Use style object streams for synchronized updates
- **Effect integration**: Combine with Effect for complex timing logic
- **No re-renders**: Updates happen directly on DOM nodes

## Usage Patterns

### Individual Property Stream
```typescript
const hueStream = Stream.iterate(0, h => (h + 1) % 360).pipe(
  Stream.schedule(Schedule.spaced("50 millis"))
);

<div style={{
  backgroundColor: Stream.map(hueStream, h => `hsl(${h}, 70%, 60%)`),
  transition: "background-color 0.1s"
}} />
```

### Style Object Stream
```typescript
const styleStream = Stream.make(
  { backgroundColor: "red", transform: "scale(1)" },
  { backgroundColor: "blue", transform: "scale(1.1)" }
).pipe(Stream.schedule(Schedule.spaced("1 second")));

<div style={styleStream} />
```

### Combined Static and Reactive
```typescript
<div style={{
  ...dynamicStream,
  position: "absolute",    // static
  transition: "all 0.3s",  // static
}} />
```

## When to Use

- Real-time visualizations and data displays
- Interactive animations responding to user input
- Theme switching with smooth transitions
- Progress indicators and loading states
- Any style that changes based on async data
