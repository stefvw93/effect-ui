/**
 * Recipe: SubscriptionRef
 *
 * This recipe demonstrates using Effect's SubscriptionRef as a reactive
 * state primitive, similar to signals in SolidJS or stores in Svelte.
 *
 * SubscriptionRef provides:
 * - A mutable reference that can be read and written
 * - A `.changes` stream that emits on every update
 * - Integration with Effect's ecosystem
 */

import { Effect, Either, Schema, Stream, SubscriptionRef } from "effect";
import { mount } from "@/api";

// ============================================================================
// Example 1: Basic Counter
// ============================================================================

const Counter = () =>
	Effect.gen(function* () {
		const count = yield* SubscriptionRef.make(0);
		const increment = () => SubscriptionRef.update(count, (n) => n + 1);
		const decrement = () => SubscriptionRef.update(count, (n) => n - 1);

		return (
			<div>
				<div class="counter">{count.changes}</div>
				<button type="button" onclick={() => decrement()}>
					-
				</button>
				<button type="button" onclick={() => increment()}>
					+
				</button>
			</div>
		);
	});

// ============================================================================
// Example 2: Derived State
// ============================================================================

const DerivedState = () =>
	Effect.gen(function* () {
		const count = yield* SubscriptionRef.make(0);

		// Derived streams computed from the base state
		const doubled = Stream.map(count.changes, (n) => n * 2);
		const squared = Stream.map(count.changes, (n) => n * n);
		const isEven = Stream.map(count.changes, (n) =>
			n % 2 === 0 ? "Yes" : "No",
		);

		const increment = () => SubscriptionRef.update(count, (n) => n + 1);

		return (
			<div>
				<p>
					Count: <strong>{count.changes}</strong>
				</p>
				<p>
					Doubled: <span class="derived">{doubled}</span>
				</p>
				<p>
					Squared: <span class="derived">{squared}</span>
				</p>
				<p>
					Is Even: <span class="derived">{isEven}</span>
				</p>
				<button type="button" onclick={() => increment()}>
					Increment
				</button>
			</div>
		);
	});

// ============================================================================
// Example 3: Object State with Schema Validation
// ============================================================================

// Define schemas for form fields
const Name = Schema.String.pipe(
	Schema.filter((s) => s.length >= 2, { message: () => "Min 2 characters" }),
);

const Email = Schema.String.pipe(
	Schema.filter((s) => s.includes("@"), { message: () => "Must contain @" }),
	Schema.filter((s) => s.includes("."), { message: () => "Must have domain" }),
);

// Form state includes both values and validation errors
interface FormState {
	name: string;
	email: string;
	errors: { name: string | null; email: string | null };
}

// Helper to validate and extract error message
const validate = <A, I>(
	schema: Schema.Schema<A, I>,
	value: I,
): string | null => {
	if (!value) return null;
	const result = Schema.decodeUnknownEither(schema)(value);
	return Either.match(result, {
		onLeft: (e) => e.message.split(":").pop()?.trim() ?? "Invalid",
		onRight: () => null,
	});
};

const ObjectState = () =>
	Effect.gen(function* () {
		const form = yield* SubscriptionRef.make<FormState>({
			name: "",
			email: "",
			errors: { name: null, email: null },
		});

		const updateName = (name: string) =>
			SubscriptionRef.update(form, (state) => ({
				...state,
				name,
				errors: { ...state.errors, name: validate(Name, name) },
			}));

		const updateEmail = (email: string) =>
			SubscriptionRef.update(form, (state) => ({
				...state,
				email,
				errors: { ...state.errors, email: validate(Email, email) },
			}));

		// Derived: check if form is valid
		const isValid = Stream.map(
			form.changes,
			(s) =>
				s.name.length > 0 &&
				s.email.length > 0 &&
				!s.errors.name &&
				!s.errors.email,
		);

		return (
			<div>
				<div style={{ marginBottom: "0.5rem" }}>
					{/* biome-ignore lint/a11y/noLabelWithoutControl: input is sibling */}
					<label>Name: </label>
					<input
						type="text"
						placeholder="Min 2 characters"
						oninput={(e) => updateName((e.target as HTMLInputElement).value)}
					/>
					{Stream.map(form.changes, (s) =>
						s.errors.name ? (
							<span style={{ color: "#c00", marginLeft: "0.5rem" }}>
								{s.errors.name}
							</span>
						) : null,
					)}
				</div>
				<div style={{ marginBottom: "0.5rem" }}>
					{/* biome-ignore lint/a11y/noLabelWithoutControl: input is sibling */}
					<label>Email: </label>
					<input
						type="email"
						placeholder="user@example.com"
						oninput={(e) => updateEmail((e.target as HTMLInputElement).value)}
					/>
					{Stream.map(form.changes, (s) =>
						s.errors.email ? (
							<span style={{ color: "#c00", marginLeft: "0.5rem" }}>
								{s.errors.email}
							</span>
						) : null,
					)}
				</div>
				<div class="preview">
					{Stream.map(form.changes, (s) =>
						s.name || s.email
							? `Name: ${s.name}\nEmail: ${s.email}`
							: "(empty)",
					)}
				</div>
				<p style={{ marginTop: "0.5rem" }}>
					Valid:{" "}
					<strong>{Stream.map(isValid, (v) => (v ? "Yes" : "No"))}</strong>
				</p>
			</div>
		);
	});

// ============================================================================
// Example 4: Todo List
// ============================================================================

interface Todo {
	id: number;
	text: string;
	done: boolean;
}

const TodoList = () =>
	Effect.gen(function* () {
		const todos = yield* SubscriptionRef.make<Todo[]>([
			{ id: 1, text: "Learn Effect", done: true },
			{ id: 2, text: "Build with effect-ui", done: false },
			{ id: 3, text: "Ship to production", done: false },
		]);

		const toggle = (id: number) =>
			SubscriptionRef.update(todos, (list) =>
				list.map((todo) =>
					todo.id === id ? { ...todo, done: !todo.done } : todo,
				),
			);

		const completedCount = Stream.map(
			todos.changes,
			(list) => list.filter((t) => t.done).length,
		);

		const totalCount = Stream.map(todos.changes, (list) => list.length);

		return (
			<div>
				<p>
					Completed: <span class="derived">{completedCount}</span> /{" "}
					{totalCount}
				</p>
				<ul style={{ listStyle: "none", padding: 0 }}>
					{Stream.map(todos.changes, (list) =>
						list.map((todo) => (
							<li
								style={{
									padding: "0.5rem",
									margin: "0.25rem 0",
									background: todo.done ? "#e8f5e9" : "#fff",
									borderRadius: "4px",
									cursor: "pointer",
									textDecoration: todo.done ? "line-through" : "none",
								}}
								onclick={() => toggle(todo.id)}
							>
								{todo.text}
							</li>
						)),
					)}
				</ul>
			</div>
		);
	});

// ============================================================================
// Example 5: Multiple Refs Coordination
// ============================================================================

const CoordinatedRefs = () =>
	Effect.gen(function* () {
		const firstName = yield* SubscriptionRef.make("");
		const lastName = yield* SubscriptionRef.make("");

		// Combine two refs into a derived stream
		const fullName = Stream.zipLatestWith(
			firstName.changes,
			lastName.changes,
			(first, last) => {
				if (!first && !last) return "(empty)";
				return `${first} ${last}`.trim();
			},
		);

		return (
			<div>
				<div style={{ marginBottom: "0.5rem" }}>
					<input
						type="text"
						placeholder="First name"
						oninput={(e) =>
							SubscriptionRef.set(
								firstName,
								(e.target as HTMLInputElement).value,
							)
						}
					/>
				</div>
				<div style={{ marginBottom: "0.5rem" }}>
					<input
						type="text"
						placeholder="Last name"
						oninput={(e) =>
							SubscriptionRef.set(
								lastName,
								(e.target as HTMLInputElement).value,
							)
						}
					/>
				</div>
				<p>
					Full name: <strong>{fullName}</strong>
				</p>
			</div>
		);
	});

// ============================================================================
// App
// ============================================================================

const App = () => (
	<div>
		<a href="../" class="back-link">
			&larr; Back to Recipes
		</a>
		<h1>SubscriptionRef</h1>

		<section>
			<h2>1. Basic Counter</h2>
			<p>Simple counter with increment/decrement.</p>
			<Counter />
		</section>

		<section>
			<h2>2. Derived State</h2>
			<p>Compute derived values from base state.</p>
			<DerivedState />
		</section>

		<section>
			<h2>3. Object State with Schema</h2>
			<p>Form state with Schema validation.</p>
			<ObjectState />
		</section>

		<section>
			<h2>4. Todo List</h2>
			<p>Array state with toggle functionality.</p>
			<TodoList />
		</section>

		<section>
			<h2>5. Coordinated Refs</h2>
			<p>Combine multiple refs into derived state.</p>
			<CoordinatedRefs />
		</section>
	</div>
);

// biome-ignore lint/style/noNonNullAssertion: playground code, element always exists
Effect.runPromise(mount(<App />, document.getElementById("root")!));
