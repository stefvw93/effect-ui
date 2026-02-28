# Type Augmentation for Context Requirements

## Overview

This recipe demonstrates how to register your app's Effect context types with the JSX type system using TypeScript's interface augmentation.

## Problem

By default, `JSXRequirements` is set to `any`, allowing components to use any Effect services without compile-time verification. While convenient, this means TypeScript won't catch missing service registrations until runtime.

## Solution

Augment the `JSX.Requirements` interface to declare which services your app uses:

```typescript
declare global {
  namespace JSX {
    interface Requirements {
      _:
        | Context.Tag.Service<typeof ServiceA>
        | Context.Tag.Service<typeof ServiceB>;
    }
  }
}
```

## How It Works

1. The framework declares an empty `JSX.Requirements` interface in `src/jsx-runtime/types/values.ts`
2. Your app augments this interface with service types
3. `JSXRequirements` computes the union of all registered types
4. Components returning `Stream` or `Effect` are validated against this union

## Benefits

- **Compile-time safety**: TypeScript errors if a component uses an unregistered service
- **Documentation**: The augmentation serves as a manifest of app-level dependencies
- **Opt-in**: Apps that don't augment continue to work with permissive typing

## Usage Pattern

Use `_` as a single key with a union of all service types. The key name doesn't matter—only the types are used.

```typescript
interface Requirements {
  _: ServiceA | ServiceB | ServiceC;
}
```

## When to Use

- Apps with multiple Effect services shared across components
- When you want compile-time verification of service dependencies
- As documentation for which services the app requires
