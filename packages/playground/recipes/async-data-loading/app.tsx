/**
 * Recipe: Async Data Loading
 *
 * This recipe demonstrates how to build components that fetch data asynchronously
 * using Effect, with built-in loading states and error handling.
 */

import { mount } from "@effect-ui/dom";
import { Effect, Stream } from "effect";

// ============================================================================
// Example 1: Loading State with Stream.concat
// ============================================================================

const LoadingThenData = () =>
	Stream.concat(
		// First: show loading state immediately
		Stream.make(<span class="loading">Loading...</span>),
		// Then: fetch data and show result
		Stream.fromEffect(
			Effect.gen(function* () {
				yield* Effect.sleep("1500 millis"); // Simulate network delay
				return <span class="data">Data loaded successfully!</span>;
			}),
		),
	);

// ============================================================================
// Example 2: Simulated API Fetch with Error Handling
// ============================================================================

interface User {
	id: number;
	name: string;
	email: string;
}

const fetchUser = (id: number): Effect.Effect<User, Error> =>
	Effect.gen(function* () {
		yield* Effect.sleep("1000 millis"); // Simulate network delay

		// Simulate occasional errors
		if (id === 3) {
			return yield* Effect.fail(new Error("User not found"));
		}

		return {
			id,
			name: `User ${id}`,
			email: `user${id}@example.com`,
		};
	});

const UserCard = ({ id }: { id: number }) =>
	Stream.concat(
		Stream.make(<div class="loading">Loading user {id}...</div>),
		Stream.fromEffect(
			fetchUser(id).pipe(
				Effect.map((user) => (
					<div class="user-card">
						<h3>{user.name}</h3>
						<p>{user.email}</p>
					</div>
				)),
				Effect.catchAll((error) =>
					Effect.succeed(
						<div class="error">
							Error loading user {id}: {error.message}
						</div>,
					),
				),
			),
		),
	);

// ============================================================================
// Example 3: Effect-Returning Component (Direct)
// ============================================================================

const DelayedGreeting = ({ name }: { name: string }) =>
	Effect.gen(function* () {
		yield* Effect.sleep("800 millis");
		return <span class="data">Hello, {name}!</span>;
	});

// ============================================================================
// Example 4: Parallel Loading
// ============================================================================

const Dashboard = () => (
	<div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
		<UserCard id={1} />
		<UserCard id={2} />
		<UserCard id={3} />
	</div>
);

// ============================================================================
// Example 5: Sequential Loading with Dependencies
// ============================================================================

const SequentialLoad = () =>
	Stream.make(<span class="loading">Step 1: Initializing...</span>).pipe(
		Stream.concat(
			Stream.fromEffect(
				Effect.gen(function* () {
					yield* Effect.sleep("1000 millis");
					return <span class="loading">Step 2: Fetching data...</span>;
				}),
			),
		),
		Stream.concat(
			Stream.fromEffect(
				Effect.gen(function* () {
					yield* Effect.sleep("1000 millis");
					return <span class="loading">Step 3: Processing...</span>;
				}),
			),
		),
		Stream.concat(
			Stream.fromEffect(
				Effect.gen(function* () {
					yield* Effect.sleep("1000 millis");
					return <span class="data">Complete!</span>;
				}),
			),
		),
	);

// ============================================================================
// App
// ============================================================================

const App = () => (
	<div>
		<a href="../" class="back-link">
			&larr; Back to Recipes
		</a>
		<h1>Async Data Loading</h1>

		<section>
			<h2>1. Loading State Pattern</h2>
			<p>Shows loading, then data after delay.</p>
			<div style={{ marginTop: "0.5rem" }}>
				<LoadingThenData />
			</div>
		</section>

		<section>
			<h2>2. Effect Component (Direct)</h2>
			<p>Component returns Effect directly.</p>
			<div style={{ marginTop: "0.5rem" }}>
				<DelayedGreeting name="World" />
			</div>
		</section>

		<section>
			<h2>3. Parallel Loading with Error Handling</h2>
			<p>Multiple users load in parallel. User 3 will fail.</p>
			<div style={{ marginTop: "0.5rem" }}>
				<Dashboard />
			</div>
		</section>

		<section>
			<h2>4. Sequential Loading Steps</h2>
			<p>Multi-step process with status updates.</p>
			<div style={{ marginTop: "0.5rem" }}>
				<SequentialLoad />
			</div>
		</section>
	</div>
);

// biome-ignore lint/style/noNonNullAssertion: playground code, element always exists
Effect.runPromise(mount(<App />, document.getElementById("root")!));
