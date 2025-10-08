# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A minimal Node.js + TypeScript project template using modern tooling and strict TypeScript configuration.

## Requirements

- Node.js ≥ 24.7.0
- pnpm ≥ 10.15.0

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

Biome enforces:
- Tab indentation
- Double quotes for strings
- Automatic import organization
- Recommended linting rules

### Project Structure

- `src/` - Source TypeScript files
- `dist/` - Build output (excluded from TypeScript compilation)
- ES modules only (`"type": "module"` in package.json)
