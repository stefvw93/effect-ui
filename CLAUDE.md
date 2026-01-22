# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A minimal Node.js + TypeScript project template using modern tooling and strict TypeScript configuration.

## Requirements

- Node.js ≥ 24.7.0
- pnpm ≥ 10.28.0

## Development Commands

### Building
```bash
pnpm build
```
Uses tsdown for fast TypeScript bundling.

### Testing
```bash
pnpm test                 # Run all tests
pnpm test.watch           # Run tests in watch mode
```
Uses Node.js native test runner with tsx loader. Test files follow the pattern `src/**/*.test.{ts,tsx}`.

### Linting
```bash
pnpm lint            # Check code with Biome
pnpm lint.fix        # Auto-fix linting issues
```

**Important:** This project uses Biome for linting and formatting, NOT ESLint. Always use Biome commands and configuration. When adding lint ignore comments, use Biome's syntax (e.g., `// biome-ignore lint/...` not `// eslint-disable`).

## Architecture

### TypeScript Configuration

Strict TypeScript setup with:
- `noUncheckedIndexedAccess: true` - Array/object access returns possibly undefined
- `noImplicitReturns: true` - All code paths must return
- `strict: true` - All strict type-checking enabled
- `verbatimModuleSyntax: true` - Import/export syntax preserved
- `isolatedModules: true` - Each file must be transpilable independently
- `noUncheckedSideEffectImports: true` - Side-effect imports must be explicit

Path aliases:
- `@/*` maps to `./src/*`
- `~/*` maps to `./*`

### Code Style

**Linting Tool:** This project uses Biome (NOT ESLint) for all linting and formatting.

Biome enforces:
- Tab indentation
- Double quotes for strings
- Automatic import organization
- Recommended linting rules

When ignoring lint rules, use Biome syntax:
- ✅ Correct: `// biome-ignore lint/correctness/noChildrenProp: testing edge case`
- ❌ Wrong: `// eslint-disable-next-line`

### Project Structure

- `src/` - Source TypeScript files
- `dist/` - Build output (excluded from TypeScript compilation)
- `playground/` - Development playground and examples
  - `app.tsx` - Main playground entry point
  - `recipes/` - Standalone example recipes demonstrating patterns
- ES modules only (`"type": "module"` in package.json)

### Recipes

The `playground/recipes/` folder contains standalone examples demonstrating specific patterns or features.

**Rules for recipes:**
- Every recipe must have a co-located README file named `{recipe-name}.readme.md`
- Recipe files should be self-contained and runnable
- Include a JSDoc header comment in the `.tsx` file explaining the recipe's purpose
- READMEs should include: Overview, Problem, Solution, How It Works, and When to Use sections

## Coding Standards

### Architecture & Patterns
- Use a hybrid approach combining functional and object-oriented programming
- Effect (effect.website) is the core library - use its patterns throughout
- Prefer Effect's error handling over try/catch (except when it significantly hurts ergonomics)
- Use Services and Layers for dependency injection
- Prefer `pipe(effect, ...)` over `effect.pipe(...)`

### TypeScript Standards
- Type assertions (`as`, `!`) only when we're "smarter" than the compiler
- `any` is allowed for generic type params and library interop only
- Use explicit type guards over implicit checks
- Prefer generic constraints over flexibility
- Treat data structures as immutable - use `readonly` extensively
- Prefer `Option` > `undefined` > `null` for optional values
- All checks should be type-level when possible
- Use Schema for validation of unknowns and I/O

### Naming Conventions
- Files: kebab-case (e.g., `user-service.ts`)
- Variables/functions: camelCase, with `is*`, `has*`, `should*` prefixes for booleans
- Types/Interfaces: PascalCase, no `I` prefix for interfaces
- Constants (shared): UPPER_SNAKE_CASE
- Prefer named exports; default exports only if absolutely necessary

### Documentation
- All exported functions, types, and values must have JSDoc comments
- JSDoc `@type` annotations can be omitted (TypeScript handles types)
- Include text descriptions for parameters when not self-explanatory
- Inline comments only when needed - avoid commenting obvious code
- TODOs and FIXMEs are acceptable
- Effect Schemas should include descriptions/annotations when not self-explanatory

### Testing
- Follow Test-Driven Development workflow: spec → mock → test → implement
- Co-locate test files (`*.test.ts`) next to source code
- `__tests__/` directory allowed for compound/integration tests and shared fixtures/helpers
- `__type-tests__/` directory for compile-time type tests (see Type Tests section below)
- Write thorough tests against the API surface and specifications in co-located `specs.md` files
- Test naming conventions:
  - Use `describe` for test grouping, `it` or `test` for individual test cases
  - Test case names should match or reference acceptance criteria from specs.md
- Coverage requirements:
  - All acceptance criteria from specs.md must be covered
  - Cover both happy paths and error paths
  - Test all possible error types defined in the Effect error union (expected errors)
  - Include edge cases defined in specifications
- Use Effect testing utilities for testing Effect code

### Type Tests
Type tests verify compile-time behavior for complex type-level features. They use `@ts-expect-error` comments to assert that certain code should NOT compile.

**Location:** `src/**/__type-tests__/*.test-d.ts`

**Running type tests:**
```bash
pnpm typecheck.type-tests
```

**Rules:**
- Type test files use the `.test-d.ts` extension (convention from `tsd` and similar tools)
- Use `@ts-expect-error` to assert code that should fail to compile
- Type tests are excluded from the main `pnpm typecheck` to avoid conflicts with other augmentations
- Each type test file should be self-contained and test a specific feature

**Example pattern:**
```typescript
// Should compile - valid usage
const _valid: SomeType = validValue;

// @ts-expect-error - Should NOT compile - invalid usage
const _invalid: SomeType = invalidValue;
```

### Specification Files
- Every new feature must have a co-located `specs.md` file (e.g., `dom/feature.ts`, `dom/feature.test.ts`, `dom/feature.specs.md`)
- Existing features without specs should get them retroactively when modified
- Every planning session must start with extensive specification discussion:
  - Ask questions to understand requirements, edge cases, and constraints
  - Draft specifications interactively with the user
  - Iterate on the spec until complete before writing implementation code
- Use "mock first, implement later" approach:
  - Before implementation, create comprehensive mocks using TypeScript's type system and `declare` keyword
  - Define complete API surface: classes/methods, function signatures, constants/variables, exports, type definitions
  - Review mocks to ensure they match specifications and types are complete
- Implementation rules:
  - Only begin actual implementation after mocks and tests are complete
  - Replace type-system level mocks (e.g., `declare` statements) with real code
  - Ensure implementation matches mock signatures exactly
  - Ensure implementation matches co-located specs.md files
  - If implementation reveals mocks/specs need changes: pause implementation and update specs/mocks first (maintain strict spec → mock → test → implement cycle)
  - After implementation: re-run tests, type checks (`pnpm typecheck`), and linting (`pnpm lint.fix`)
- Specs MUST include:
  - Feature overview and purpose
  - Detailed acceptance criteria
- Specs COULD include:
  - Technical requirements and constraints
  - Dependencies and integrations
  - Expected behavior and edge cases
- Follow a common structure with standard headings, but allow flexibility between specs

### Error Handling
- Use Effect's tagged errors as the primary error handling mechanism
- Error messages should be descriptive and include context/debugging info when useful
- Input validation required only for unsafe input (user input, `unknown` input)
- Handle errors at program edges when possible

### Module Organization
- Organize code by domain
- Barrel exports (`index.ts`) only for grouping application domains:
  - `dom/index.ts` - DOM utilities
  - `server/index.ts` - Server utilities
  - `lib/index.ts` - Other utilities
- Avoid circular dependencies
- Use `/utils` only for common code that doesn't fit a specific domain

### Effect-Specific Patterns
- Prefer Effect logic throughout the codebase
- Use Effect Schema for data structures and validation
- Wrap functionality in Services when capabilities need to be shared across modules/components
- Manage runtimes only when explicitly required
- `Effect.gen` vs `pipe` depends on the specific feature and readability

### Code Reuse
- Wait for multiple use cases before abstracting - avoid premature abstraction
- Organize shared utilities by domain; use `/utils` only for cross-cutting concerns
- Duplication vs abstraction is case-by-case - prefer duplication over poor abstraction

### Performance
- Readability first, performance second
- Use memoization only when explicitly specified or instructed
- Be mindful of bundle size: import specific items, not `import * as X`
- `Effect.gen` vs `pipe` choice depends on the feature and readability

### Imports
- Use specific imports, avoid `import * as X`
- Biome handles import organization automatically

## Meta Rules

- Always discuss new rules and rule changes in Q&A style. Ask a question and await the answer before asking the next question, until sufficient information is provided.