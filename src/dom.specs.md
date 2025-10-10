# DOM Mount Feature Specification

## Overview

Build a reactive DOM mounting system that renders JSX to HTML elements with support for Effect and Stream-based reactivity. Components are ephemeral - executed once to set up their reactive side effects. Streams and Effects drive updates over time, similar to SolidJS's reactive model.

## Purpose

Enable declarative, reactive UI rendering in the browser by mounting JSX trees to DOM elements, with full support for Effect and Stream primitives for handling asynchronous and time-varying values.

## Acceptance Criteria

### AC1: Mount Function API
- **Given** a JSXNode and a root HTMLElement
- **When** `mount(app, root)` is called
- **Then** it returns `Effect.Effect<void>` that:
  - Clears the root element's existing children
  - Renders the JSX tree to DOM nodes
  - Appends rendered nodes to root
  - Completes after initial render (streams run in background)
  - Creates a fresh ManagedRuntime per mount
  - Logs warning about runtime leaks (cleanup not yet implemented)

### AC2: Primitive JSXNode Rendering
- **Given** primitive JSXNode values
- **When** rendering occurs
- **Then**:
  - `string`, `number`, `bigint` → text nodes
  - `boolean`, `null`, `undefined`, `void` → render nothing (skip)

### AC3: Iterable Children
- **Given** JSXNode that is an iterable (including nested iterables)
- **When** rendering children
- **Then** recursively flatten all iterables and render each child

### AC4: Element Creation
- **Given** JSXNode with `{ type: string, props: object }`
- **When** rendering
- **Then**:
  - Create element using `document.createElement(type)` (HTML only, SVG/MathML later)
  - Browser validates element type (no manual validation)
  - Render order: create → set attrs/props → set up streams → append children → append to parent

### AC5: Function Components
- **Given** JSXNode with `{ type: function, props: object }`
- **When** rendering
- **Then**:
  - Call function once with props (ephemeral execution)
  - Function can return: JSXNode, Effect<JSXNode>, or Stream<JSXNode>
  - Effects and Streams normalized to Streams and handled reactively
  - Component doesn't re-execute (no re-rendering)

### AC6: Fragment Handling
- **Given** JSXNode with `{ type: FRAGMENT, props: { children } }`
- **When** rendering
- **Then**:
  - Render children without wrapper element
  - At root level: append all children to root element
  - As child: append all fragment children to parent

### AC7: Attribute vs Property Detection
- **Given** element props (excluding `children`)
- **When** setting props on element
- **Then**:
  - Check prototype chain (`prop in element` + walk prototypes) to distinguish properties from attributes
  - `data-*` and `aria-*` always treated as attributes
  - Properties: use `element[prop] = value`
  - Attributes: use `element.setAttribute(prop, value)`
  - Skip `children` prop

### AC8: Boolean Attributes
- **Given** boolean attribute (e.g., `disabled`, `checked`, `readonly`)
- **When** setting attribute
- **Then**:
  - Follow HTML spec for each element type
  - Truthy value: `setAttribute(name, "")`
  - Falsy value: `removeAttribute(name)`

### AC9: Attribute Value Serialization
- **Given** non-string attribute value
- **When** setting attribute
- **Then**:
  - Convert to string using `String(value)`
  - `undefined` values: skip/remove attribute
  - `null` values: not valid, skip/remove

### AC10: Style Attribute - String Form
- **Given** `style` prop as string (e.g., `style="background: blue;"`)
- **When** rendering
- **Then**: use `element.setAttribute("style", value)`

### AC11: Style Attribute - Object Form
- **Given** `style` prop as object (e.g., `style={{ fontSize: "16px", color: "red" }}`)
- **When** rendering
- **Then**:
  - Iterate through object properties
  - Use `element.style.setProperty(key, value)` for each
  - Property names use camelCase (matches CSSStyleDeclaration)

### AC12: Style with Stream Properties
- **Given** `style` object with Stream values (e.g., `style={{ color: Stream.make("red"), fontSize: "16px" }}`)
- **When** rendering
- **Then**:
  - Static properties set once
  - Each Stream property sets up independent subscription
  - Each emission updates only that CSS property

### AC13: Style as Stream
- **Given** `style` prop as `Stream<string>` or `Stream<object>`
- **When** stream emits
- **Then**:
  - If string: replace entire style attribute
  - If object: replace all style properties
  - Handle both cases appropriately

### AC14: Effect/Stream Normalization
- **Given** Effect or Stream values in JSX
- **When** rendering begins
- **Then**:
  - Normalize all Effects to Streams using `Stream.fromEffect`
  - Applies to: attributes, properties, style properties, children, component return values

### AC15: Reactive Attribute/Property Updates
- **Given** attribute or property value as Stream
- **When** stream emits
- **Then**:
  - Each emission updates that specific attribute/property
  - `null` or `undefined` emission removes the attribute/property
  - Use `Stream.runForEach` in forked fiber with Scope
  - Stream runs in background (doesn't block render)

### AC16: Stream Completion
- **Given** a Stream that completes without error
- **When** completion occurs
- **Then**: leave last rendered value in place

### AC17: Stream Errors
- **Given** a Stream that fails
- **When** error occurs
- **Then**:
  - Throw tagged error that bubbles up
  - Log error/warning with context
  - Error types: `StreamSubscriptionError`

### AC18: Children Array with Mixed Streams
- **Given** children array with mix of static and Stream values (e.g., `[Stream.make("a"), "b", Stream.make("c")]`)
- **When** rendering
- **Then**:
  - Each child rendered in order
  - Each Stream child updates its position independently
  - Static children remain static

### AC19: Stream Children - Comment Markers
- **Given** a child that is a Stream
- **When** rendering
- **Then**:
  - Insert start comment marker: `<!-- stream-start-{id} -->`
  - Render placeholder comment initially
  - Insert end comment marker: `<!-- stream-end-{id} -->`
  - Use simple counter for unique IDs
  - Keep internal reference to track nodes

### AC20: Stream Children - Updates
- **Given** a Stream child that emits new value
- **When** emission occurs
- **Then**:
  - Find start and end comment markers
  - Remove all nodes between comments (iterate from `startComment.nextSibling` until `endComment`)
  - Render new JSXNode value
  - Insert new nodes between comments
  - New value can be array/fragment (multiple nodes)
  - Text nodes replaced entirely (not updated in place)

### AC21: Nested Streams in Dynamic Children
- **Given** a Stream child that emits JSXNode containing Streams
- **When** rendering the emitted JSXNode
- **Then**:
  - Recursively set up all nested streams
  - Dynamically rendered content gets full reactive support

### AC22: Component Returning Stream
- **Given** function component that returns `Stream<JSXNode>`
- **When** rendering
- **Then**:
  - Normalize to Stream
  - Treat as stream child (updates over time)
  - Wrap in comment markers

### AC23: Tagged Errors
- **Given** various error conditions during rendering
- **When** error occurs
- **Then** throw appropriate tagged error:
  - `InvalidElementType` - JSXNode type not string/FRAGMENT/function
  - `StreamSubscriptionError` - stream subscription/execution fails
  - `RenderError` - general rendering failures
  - All errors include useful context for debugging

### AC24: Runtime Management
- **Given** mount is called
- **When** creating runtime
- **Then**:
  - Create fresh `ManagedRuntime` per mount
  - Use `ManagedRuntime.make(Layer.empty)` or similar
  - Runtime must be properly disposed on unmount
  - No warnings about runtime leaks when properly cleaned up

### AC25: Scope Management
- **Given** stream subscriptions
- **When** setting up subscriptions
- **Then**:
  - Use Scopes for cleanup support
  - Fork streams in Scope context
  - All scopes closed on unmount

### AC26: Unmount Function
- **Given** a mounted JSX tree
- **When** `unmount()` is called on the cleanup function
- **Then**:
  - Dispose the ManagedRuntime properly using `ManagedRuntime.dispose`
  - Close all Scopes to cancel running streams
  - Stop all stream subscriptions
  - Returns an Effect that completes when cleanup is done
  - No runtime leak warnings after proper cleanup

### AC27: Mount Return Value
- **Given** mount function is called
- **When** the mount Effect completes
- **Then**:
  - Returns a cleanup function object with `unmount()` method
  - The cleanup function can be called to properly dispose resources
  - Calling unmount multiple times is safe (idempotent)

## Technical Requirements

### Dependencies
- Effect library for Effect, Stream, Layer, Scope primitives
- JSX runtime types from `@/jsx-runtime`
- Browser DOM APIs

### Architecture
- Keep implementation in `src/dom.tsx` initially
- Split into multiple files if implementation grows large
- Use Effect patterns throughout (avoid try/catch unless ergonomics suffer)
- Follow strict TypeScript config: use type guards, careful narrowing

### Performance Considerations
- Static values don't create streams (optimization for common case)
- Comment markers for tracking positions (minimal DOM overhead)
- Internal references for efficient updates

### Browser Compatibility
- Modern browsers only (no polyfills planned)
- Relies on standard DOM APIs

### Future Extensions
- SVG namespace support (`createElementNS`)
- MathML namespace support
- Custom elements support
- Event handlers
- HMR support
- Keyed children and reconciliation

## Constraints

- HTML elements only (no SVG/MathML yet)
- No event handlers yet
- No custom elements support yet
- No prop name mapping (`class` not `className` - stay close to HTML spec)
- No HMR support yet

## Success Criteria Summary

1. Static JSX renders correctly to DOM
2. Stream-based attributes/properties update reactively
3. Stream-based children update reactively with proper positioning
4. Style attribute supports string and object forms with streams
5. Function components work with plain JSXNode, Effects, and Streams
6. Fragments render without wrapper elements
7. Errors are tagged with useful context
8. Effect completes after initial render, streams run in background
9. TypeScript types are strict and sound
10. Code follows Effect patterns and project standards
