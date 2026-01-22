# List Rendering

## Overview

This recipe demonstrates patterns for rendering lists in effect-ui, including static arrays, stream-based lists, and Fragment usage.

## Problem

Lists are fundamental to web UIs. Traditional frameworks require special handling for keys, conditional rendering, and dynamic updates. Understanding how effect-ui handles arrays and iterables is essential.

## Solution

effect-ui supports multiple list rendering patterns:

```typescript
// Static array mapping
<ul>{items.map(item => <li>{item}</li>)}</ul>

// Fragment for multiple elements
const TableRow = () => (
  <>
    <td>Cell 1</td>
    <td>Cell 2</td>
  </>
);

// Stream of arrays
const itemsStream = Stream.iterate([], items => [...items, newItem]);
<ul>{Stream.map(itemsStream, items => items.map(i => <li>{i}</li>))}</ul>
```

## How It Works

1. Arrays are flattened during rendering - nested arrays work naturally
2. `<>...</>` (Fragment) renders children without a wrapper element
3. Streams of arrays replace the entire list on each emission
4. Individual list items can have their own reactive streams
5. Comment markers track stream positions for efficient updates

## Benefits

- **Natural syntax**: Standard array.map() works as expected
- **Fragments**: No extra DOM nodes for multi-element returns
- **Reactive lists**: Stream-based arrays for dynamic content
- **Nested support**: Deep array nesting handled automatically
- **Mixed content**: Static and reactive items can coexist

## Usage Patterns

### Static Array
```typescript
const items = ["A", "B", "C"];
<ul>{items.map(item => <li>{item}</li>)}</ul>
```

### Fragment Component
```typescript
const TableRow = ({ data }) => (
  <>
    <td>{data.name}</td>
    <td>{data.value}</td>
  </>
);

<table>
  <tr><TableRow data={row} /></tr>
</table>
```

### Growing List
```typescript
const itemsStream = Stream.iterate(
  ["Initial"],
  items => [...items, `Item ${items.length + 1}`]
).pipe(Stream.schedule(Schedule.spaced("1 second")));

<ul>
  {Stream.map(itemsStream, items =>
    items.map(item => <li>{item}</li>)
  )}
</ul>
```

### Items with Individual Streams
```typescript
const items = ids.map(id => ({
  id,
  valueStream: fetchDataStream(id)
}));

<ul>
  {items.map(item => (
    <li>{item.id}: {item.valueStream}</li>
  ))}
</ul>
```

### Nested Lists
```typescript
const categories = [
  { name: "A", items: ["A1", "A2"] },
  { name: "B", items: ["B1", "B2"] },
];

{categories.map(cat => (
  <div>
    <h3>{cat.name}</h3>
    <ul>{cat.items.map(i => <li>{i}</li>)}</ul>
  </div>
))}
```

## When to Use

- Displaying collections of data
- Table rows that return multiple cells
- Tag/badge lists without wrappers
- Real-time updating lists
- Any component that needs to return multiple elements
