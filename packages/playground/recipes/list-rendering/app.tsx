/**
 * Recipe: List Rendering
 *
 * This recipe demonstrates patterns for rendering lists in effect-ui,
 * including static arrays, stream-based lists, and Fragment usage.
 */

import { mount } from "@effect-ui/dom";
import { Effect, Schedule, Stream } from "effect";

// ============================================================================
// Example 1: Static Array Rendering
// ============================================================================

const StaticList = () => {
	const items = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

	return (
		<ul>
			{items.map((item) => (
				<li>{item}</li>
			))}
		</ul>
	);
};

// ============================================================================
// Example 2: Fragment for Table Rows
// ============================================================================

interface User {
	name: string;
	role: string;
	status: string;
}

const TableRow = ({ user }: { user: User }) => (
	<>
		<td>{user.name}</td>
		<td>{user.role}</td>
		<td>{user.status}</td>
	</>
);

const UserTable = () => {
	const users: User[] = [
		{ name: "Alice", role: "Admin", status: "Active" },
		{ name: "Bob", role: "User", status: "Active" },
		{ name: "Charlie", role: "User", status: "Inactive" },
	];

	return (
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Role</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{users.map((user) => (
					<tr>
						<TableRow user={user} />
					</tr>
				))}
			</tbody>
		</table>
	);
};

// ============================================================================
// Example 3: Stream of Arrays (Growing List)
// ============================================================================

const GrowingList = () => {
	const itemsStream = Stream.iterate(["Item 1"], (items) => [
		...items,
		`Item ${items.length + 1}`,
	]).pipe(Stream.schedule(Schedule.spaced("1 second")), Stream.take(5));

	return (
		<ul>
			{Stream.map(itemsStream, (items) => items.map((item) => <li>{item}</li>))}
		</ul>
	);
};

// ============================================================================
// Example 4: Nested Iterables
// ============================================================================

const NestedList = () => {
	const categories = [
		{ name: "Fruits", items: ["Apple", "Banana"] },
		{ name: "Vegetables", items: ["Carrot", "Broccoli"] },
		{ name: "Dairy", items: ["Milk", "Cheese", "Yogurt"] },
	];

	return (
		<div>
			{categories.map((category) => (
				<div style={{ marginBottom: "1rem" }}>
					<strong>{category.name}</strong>
					<ul>
						{category.items.map((item) => (
							<li>{item}</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
};

// ============================================================================
// Example 5: Badges with Fragment
// ============================================================================

const TagList = ({ tags }: { tags: string[] }) => (
	<>
		{tags.map((tag, i) => (
			<span class={`badge ${["blue", "green", "purple"][i % 3]}`}>{tag}</span>
		))}
	</>
);

const BadgeDemo = () => {
	const skills = ["TypeScript", "Effect", "React", "Node.js", "GraphQL"];

	return (
		<div>
			<p>Skills: </p>
			<TagList tags={skills} />
		</div>
	);
};

// ============================================================================
// Example 6: Live Counter List
// ============================================================================

const LiveCounterList = () => {
	// Each item has its own stream
	const counters = [1, 2, 3].map((id) => ({
		id,
		valueStream: Stream.iterate(0, (n) => n + 1).pipe(
			Stream.schedule(Schedule.spaced(`${id * 500} millis`)),
			Stream.take(10),
		),
	}));

	return (
		<ul>
			{counters.map((counter) => (
				<li>
					Counter {counter.id}: {counter.valueStream}
				</li>
			))}
		</ul>
	);
};

// ============================================================================
// App
// ============================================================================

const App = () => (
	<div>
		<a href="../" class="back-link">
			&larr; Back to Recipes
		</a>
		<h1>List Rendering</h1>

		<section>
			<h2>1. Static Array</h2>
			<p>Simple array.map() to render items.</p>
			<StaticList />
		</section>

		<section>
			<h2>2. Fragment for Table Rows</h2>
			<p>Fragment returns multiple td elements without wrapper.</p>
			<UserTable />
		</section>

		<section>
			<h2>3. Growing List (Stream of Arrays)</h2>
			<p>List grows over time via stream.</p>
			<GrowingList />
		</section>

		<section>
			<h2>4. Nested Iterables</h2>
			<p>Arrays within arrays flatten correctly.</p>
			<NestedList />
		</section>

		<section>
			<h2>5. Badges with Fragment</h2>
			<p>Fragment component returns inline badges.</p>
			<BadgeDemo />
		</section>

		<section>
			<h2>6. Live Counters</h2>
			<p>Each list item has its own reactive stream.</p>
			<LiveCounterList />
		</section>
	</div>
);

// biome-ignore lint/style/noNonNullAssertion: playground code, element always exists
Effect.runPromise(mount(<App />, document.getElementById("root")!));
