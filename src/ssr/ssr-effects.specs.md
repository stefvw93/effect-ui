# SSR Effects Rendering Specification

## Overview
Specification for rendering Effect-based components during server-side rendering.

## Acceptance Criteria

### Basic Effect Support

1. **Effect Detection**
   - System MUST detect when a component returns an Effect
   - System MUST distinguish Effects from regular JSX nodes
   - System MUST use Effect.isEffect for detection

2. **Effect Resolution**
   - System MUST resolve Effects to their contained JSX values
   - System MUST handle Effect.succeed with JSX content
   - System MUST handle Effect.gen functions that return JSX

3. **Async Effect Handling**
   - System MUST handle Effects with async operations (e.g., Effect.sleep)
   - System MUST await Effect completion before rendering
   - System MUST handle Effect timeouts gracefully

### Nested Effect Support

4. **Effects in Arrays**
   - System MUST handle arrays containing Effect components
   - System MUST resolve each Effect independently
   - System MUST maintain array order after resolution

5. **Effects in Component Trees**
   - System MUST handle Effects returned by child components
   - System MUST handle deeply nested Effect components
   - System MUST preserve component hierarchy

### Error Handling

6. **Effect Failures**
   - System MUST catch Effect.fail errors
   - System MUST provide meaningful error messages
   - System MUST fallback gracefully on Effect errors

7. **Timeout Handling**
   - System MUST timeout long-running Effects
   - System MUST provide configurable timeout values
   - System MUST render fallback content on timeout

### Known Limitations

8. **YieldWrap Issues**
   - System currently has issues with Effect.gen components that yield other Effects
   - YieldWrap objects may leak through during complex Effect compositions
   - Workaround: Components should return JSX directly for SSR

9. **Generator Context Issues**
   - Mixing Effect.gen contexts can cause internal state issues
   - Nested generators may produce unexpected YieldWrap objects
   - Workaround: Avoid Effect.gen in SSR components

### Testing Requirements

10. **Effect Component Tests**
    - Test simple Effect.succeed components
    - Test Effect.gen components with async operations
    - Test Effect error handling
    - Test Effect timeout scenarios

## Technical Requirements

- Must integrate with existing SSR pipeline
- Must not break synchronous component rendering
- Must provide clear error messages for Effect issues
- Should document workarounds for known limitations

## Implementation Notes

The current implementation handles Effects in `renderNodeToString`:
- Detects Effects using `isEffect(node)`
- Resolves Effects using `Effect.gen` and `yield*`
- Handles errors by converting to SSRRenderError

Known issue with YieldWrap requires further investigation into Effect internals.