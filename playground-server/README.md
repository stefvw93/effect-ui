# Server Playground - effect-ui SSR

This is the server-side rendering playground for effect-ui, demonstrating SSR capabilities with streaming HTML, async components, and progressive hydration.

## Features

- 🚀 **Server-Side Rendering** - Full SSR with effect-ui components
- 🌊 **Streaming HTML** - Stream HTML chunks as they're generated
- ⚡ **Async Components** - Support for Effect-based async data loading
- 💧 **Progressive Hydration** - Components marked for client-side hydration
- 📊 **Stream Handling** - Graceful handling of Effect Streams (awaits first value)

## Getting Started

### Run the Server

```bash
# From the project root
pnpm dev:server
```

The server will start on http://localhost:3001

### Run Both Client and Server Playgrounds

```bash
# Client playground (Vite) on port 3000
pnpm dev

# Server playground on port 3001
pnpm dev:server

# Or run both together (requires concurrently)
pnpm dev:all
```

## Available Routes

- **`/`** - Home page with overview
- **`/examples`** - Various SSR examples (counter, lists, conditional rendering)
- **`/streaming`** - Demonstration of Stream handling in SSR
- **`/async`** - Async components with Effect
- **`/api/data`** - API response example
- **`/*`** - 404 page for unmatched routes

## How It Works

The server uses effect-ui's `renderToStream` function to generate HTML on the server:

```tsx
import { renderToStream } from "@/ssr";

// Render JSX to streaming HTML
const htmlStream = renderToStream(<App />, {
  includeDoctype: true,
  enableHydration: true,
  enableProgressiveHydration: true
});

// Stream to HTTP response
await Effect.runPromise(
  Stream.runForEach(htmlStream, chunk =>
    Effect.sync(() => res.write(chunk))
  )
);
```

## Key Concepts

### Async Components

Components can use Effect for async operations:

```tsx
function AsyncDataLoader() {
  return Effect.gen(function* () {
    // Simulate async data loading
    yield* Effect.sleep(50);
    const data = yield* fetchData();

    return <div>{data}</div>;
  });
}
```

### Stream Handling

During SSR, Effect Streams render only their first emitted value:

```tsx
const messages = Stream.make(
  "First message (rendered)",
  "Second message (not rendered in SSR)",
  "Third message (not rendered in SSR)"
);

// Only "First message" appears in SSR HTML
<div>{messages}</div>
```

### Progressive Hydration

Components are marked with hydration metadata for client-side enhancement:

```html
<!-- Server-rendered HTML includes hydration markers -->
<div data-hid="0" data-component="Counter" data-hydrate-priority="visible">
  <button type="button">Click me</button>
</div>
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `HOST` - Server host (default: localhost)

## Architecture

```
playground-server/
├── src/
│   └── server.tsx    # Main server file with all components
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

## Development

The server automatically reloads on file changes when using `pnpm dev:server`.

### Adding New Routes

Edit `playground-server/src/server.tsx` and add your route in the `handleRequest` function:

```tsx
switch (path) {
  case "/your-route":
    pageContent = <YourComponent />;
    pageTitle = "Your Page";
    break;
  // ...
}
```

### Testing SSR Features

1. **Test streaming**: Check the Network tab to see HTML chunks arriving
2. **Test async components**: Add artificial delays with `Effect.sleep`
3. **Test error handling**: Throw errors in components to see fallbacks
4. **Test hydration markers**: Inspect the HTML for `data-hid` attributes

## Comparison with Client Playground

| Feature | Client Playground | Server Playground |
|---------|------------------|-------------------|
| Rendering | Client-side DOM | Server-side HTML |
| Streams | Full reactivity | First value only |
| Interactivity | Immediate | After hydration |
| Initial Load | JavaScript required | Works without JS |
| SEO | Limited | Full support |

## Troubleshooting

- **Port already in use**: Change the port with `PORT=3002 pnpm dev:server`
- **TypeScript errors**: Run `pnpm typecheck` to check types
- **Linting issues**: Run `pnpm lint.fix` to fix formatting

## Next Steps

- Add more complex async data fetching examples
- Implement suspense boundaries
- Add database integration examples
- Create isomorphic components that work on both client and server