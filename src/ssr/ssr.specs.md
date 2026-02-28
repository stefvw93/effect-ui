# Server-Side Rendering Feature Specification

## Overview

Build a server-side rendering system that generates HTML strings from JSX trees, with support for Effect Streams (awaiting first value), async components, and progressive hydration markers. The SSR system outputs a `Stream<string>` for efficient streaming responses with backpressure support.

## Purpose

Enable server-side rendering of effect-ui applications for improved initial page load performance, SEO, and progressive enhancement. Support streaming responses and progressive hydration for optimal user experience.

## Acceptance Criteria

### AC1: RenderToStream Function API
- **Given** a JSXNode tree
- **When** `renderToStream(node, options?)` is called
- **Then** it returns `Stream.Stream<string>` that:
  - Emits HTML chunks as they are generated
  - Supports backpressure for large responses
  - Completes when entire tree is rendered
  - Includes proper DOCTYPE if `includeDoctype: true` in options
  - Uses provided `EffectUIRuntime` with `environment: "server"`

### AC2: Primitive Node Rendering
- **Given** primitive JSXNode values
- **When** rendering to HTML
- **Then**:
  - `string`, `number`, `bigint` → HTML-escaped text
  - `boolean`, `null`, `undefined`, `void` → empty string
  - Special characters escaped: `<`, `>`, `&`, `"`, `'`

### AC3: HTML Element Rendering
- **Given** JSXNode with `{ type: string, props: object }`
- **When** rendering to HTML
- **Then**:
  - Generate opening tag: `<{type} {attrs}>`
  - Render children recursively
  - Generate closing tag: `</{type}>`
  - Self-closing tags (void elements) rendered without closing tag
  - Void elements: area, base, br, col, embed, hr, img, input, link, meta, param, source, track, wbr

### AC4: Attribute Serialization
- **Given** element props (excluding `children`)
- **When** serializing to HTML attributes
- **Then**:
  - Skip `children`, `key`, and event handler props (onClick, etc.)
  - Boolean attributes: true → `attr=""`, false → omitted
  - `className` → `class` attribute
  - `htmlFor` → `for` attribute
  - `style` object → CSS string with kebab-case properties
  - `style` string → used as-is (escaped)
  - `data-*` and `aria-*` → always included as attributes
  - Values HTML-attribute-escaped with quotes

### AC5: Style Attribute Handling
- **Given** style prop in various formats
- **When** rendering to HTML
- **Then**:
  - String style → HTML-escaped and used as-is
  - Object style → converted to CSS string (camelCase to kebab-case)
  - `undefined`/`null` properties in object → skipped
  - Number values → converted to `px` for applicable properties
  - CSS custom properties (--*) → preserved as-is

### AC6: Function Component Rendering
- **Given** JSXNode with `{ type: function, props: object }`
- **When** rendering on server
- **Then**:
  - Call function once with props (ephemeral execution)
  - Handle return types:
    - Plain JSXNode → render recursively
    - `Effect<JSXNode>` → await and render result
    - `Stream<JSXNode>` → await first value and render
  - Add component boundary markers if hydration enabled

### AC7: Fragment Rendering
- **Given** JSXNode with `{ type: FRAGMENT, props: { children } }`
- **When** rendering to HTML
- **Then**:
  - Render children without wrapper element
  - No HTML output for fragment itself
  - Children rendered in sequence

### AC8: Iterable Children Rendering
- **Given** JSXNode that is an iterable
- **When** rendering children
- **Then**:
  - Recursively flatten nested iterables
  - Render each child in order
  - No wrapper elements added

### AC9: Effect Stream Handling
- **Given** a Stream as JSXNode or attribute value
- **When** rendering on server
- **Then**:
  - Use `Stream.runHead()` to await first emitted value
  - Render first value (or empty if stream is empty)
  - Add `data-stream-id` marker for hydration
  - Include stream ID in hydration manifest
  - Timeout after configurable duration (default 5 seconds)

### AC10: Async Component Support
- **Given** component returning `Effect.Effect<JSXNode>`
- **When** rendering on server
- **Then**:
  - Await Effect resolution using runtime
  - Render resolved JSXNode value
  - Propagate Effect errors appropriately
  - Maintain Effect context/services

### AC11: Hydration Markers
- **Given** hydration is enabled in options
- **When** rendering elements and components
- **Then**:
  - Add `data-hid` (hydration ID) to interactive elements
  - Insert `<!-- hid:{id} -->` comments for component boundaries
  - Add `data-stream-id` for stream positions
  - Generate sequential, unique IDs per render

### AC12: Progressive Hydration Metadata
- **Given** progressive hydration is enabled
- **When** rendering interactive components
- **Then**:
  - Mark components with `data-hydrate-priority` (immediate, visible, idle)
  - Add `data-component` attribute with component identifier
  - Include props hash for validation during hydration
  - Serialize minimal state needed for hydration

### AC13: HTML Escaping
- **Given** text content or attribute values
- **When** rendering to HTML
- **Then**:
  - Escape `<` → `&lt;`
  - Escape `>` → `&gt;`
  - Escape `&` → `&amp;`
  - Escape `"` → `&quot;` (in attributes)
  - Escape `'` → `&#39;` (in attributes)
  - Prevent XSS vulnerabilities

### AC14: Streaming Response Support
- **Given** renderToStream returns Stream<string>
- **When** consuming the stream
- **Then**:
  - Chunks emitted as tree is traversed
  - Support for backpressure handling
  - Efficient memory usage for large trees
  - Proper stream completion signal

### AC15: Error Handling
- **Given** errors during SSR
- **When** error occurs
- **Then**:
  - Emit error boundary comment: `<!-- error-boundary -->`
  - Log error with context
  - Continue rendering siblings if possible
  - Return partial HTML up to error point
  - Tagged errors: `SSRRenderError`, `AsyncComponentError`

### AC16: Runtime Context
- **Given** SSR needs Effect runtime
- **When** rendering
- **Then**:
  - Accept `EffectUIRuntime` in options
  - Set `environment: "server"` in runtime
  - Provide runtime to all Effects
  - Support custom layers/services

### AC17: Suspense Boundaries (Future)
- **Given** async components with loading states
- **When** rendering with suspense support
- **Then**:
  - Insert placeholder HTML with `data-suspense-id`
  - Stream updates when async components resolve
  - Support out-of-order streaming
  - Include inline script for client-side replacement

### AC18: Event Handler Serialization
- **Given** event handler props (onClick, onChange, etc.)
- **When** rendering on server
- **Then**:
  - Skip event handlers (not serializable)
  - Add `data-has-handlers` marker for hydration
  - Store handler references in hydration manifest
  - Reattach handlers during client hydration

### AC19: Hydrate Function API
- **Given** SSR-rendered HTML in browser
- **When** `hydrate(app, root)` is called
- **Then**:
  - Find all hydration markers
  - Progressively hydrate based on priority
  - Reattach event listeners
  - Restore stream subscriptions
  - Validate props hash for consistency

### AC20: Hydration Priority Strategies
- **Given** components with different priorities
- **When** hydrating on client
- **Then**:
  - `immediate` → hydrate synchronously on load
  - `visible` → hydrate when in viewport (IntersectionObserver)
  - `idle` → hydrate during idle time (requestIdleCallback)
  - Default to `visible` for unmarked components

## Technical Requirements

### Dependencies
- Effect library for Stream, Effect, Runtime primitives
- JSX runtime types from `@/jsx-runtime`
- No DOM dependencies (runs in Node.js)

### Architecture
- Separate SSR module in `src/ssr/`
- Share common code with client renderer via `src/shared/`
- Pure functions for HTML generation
- Stream-based for efficient memory usage

### Performance Considerations
- Stream chunks for reduced time-to-first-byte
- Minimal string allocations
- Efficient escaping algorithms
- Lazy hydration for better interactivity

### Node.js Compatibility
- No browser-specific APIs
- Pure JavaScript/TypeScript
- Compatible with Node.js streams via adapters

### Testing Strategy
- Unit tests for each rendering scenario
- Integration tests with full JSX trees
- Streaming behavior tests
- Hydration tests in jsdom
- Error boundary tests

## Constraints

- No support for:
  - Portals (require DOM)
  - Dynamic stream updates after first value
  - Client-only components (must handle gracefully)
  - Stateful class components
- Event handlers not executed on server
- Streams await first value only

## Future Extensions

- Suspense with out-of-order streaming
- Resumable hydration (preserve state)
- Island architecture support
- RSC (React Server Component) style streaming
- Selective hydration based on user interaction
- Build-time static generation
- Edge runtime support

## Success Criteria Summary

1. Generate valid HTML from JSX trees
2. Stream HTML chunks efficiently
3. Await first value from Effect Streams
4. Support async Effect-based components
5. Include hydration markers for progressive enhancement
6. Properly escape all user content
7. Handle errors gracefully with boundaries
8. Maintain Effect patterns throughout
9. Full TypeScript type safety
10. Comprehensive test coverage of all scenarios