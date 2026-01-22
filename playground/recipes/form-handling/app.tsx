/**
 * Recipe: Form Handling
 *
 * This recipe demonstrates reactive form handling with stream-based inputs,
 * validation, and Effect-powered submit handlers.
 */

import { Effect, Stream } from "effect";
import { mount } from "@/api";

// ============================================================================
// Helper: Create an emitter for form values
// ============================================================================

function createEmitter<T>(initial: T) {
	let currentValue = initial;
	let listener: ((value: T) => void) | null = null;

	const stream = Stream.async<T>((emit) => {
		emit.single(currentValue);
		listener = (value: T) => {
			currentValue = value;
			emit.single(value);
		};
		return Effect.sync(() => {
			listener = null;
		});
	});

	const emit = (value: T) => {
		if (listener) {
			listener(value);
		}
	};

	return [stream, emit] as const;
}

// ============================================================================
// Example 1: Basic Reactive Input
// ============================================================================

const BasicInput = () => {
	const [valueStream, setValue] = createEmitter("");

	return (
		<div>
			<input
				type="text"
				placeholder="Type something..."
				oninput={(e) => setValue((e.target as HTMLInputElement).value)}
			/>
			<div class="preview">You typed: {valueStream}</div>
		</div>
	);
};

// ============================================================================
// Example 2: Email Validation
// ============================================================================

const EmailInput = () => {
	const [emailStream, setEmail] = createEmitter("");

	const validationStream = Stream.map(emailStream, (email) => {
		if (email.length === 0) return null;
		if (!email.includes("@")) return "Must contain @";
		if (!email.includes(".")) return "Must contain a domain";
		return null;
	});

	return (
		<div class="form-group">
			{/* biome-ignore lint/a11y/noLabelWithoutControl: input is sibling */}
			<label>Email</label>
			<input
				type="email"
				placeholder="user@example.com"
				oninput={(e) => setEmail((e.target as HTMLInputElement).value)}
			/>
			<div>
				{Stream.map(validationStream, (error) =>
					error ? (
						<span class="error-text">{error}</span>
					) : (
						<span class="success-text">Valid email</span>
					),
				)}
			</div>
		</div>
	);
};

// ============================================================================
// Example 3: Character Counter
// ============================================================================

const CharacterCounter = () => {
	const [textStream, setText] = createEmitter("");
	const maxLength = 100;

	const countStream = Stream.map(textStream, (text) => text.length);
	const remainingStream = Stream.map(countStream, (count) => maxLength - count);

	return (
		<div class="form-group">
			{/* biome-ignore lint/a11y/noLabelWithoutControl: input is sibling */}
			<label>Bio (max {maxLength} chars)</label>
			<textarea
				placeholder="Tell us about yourself..."
				oninput={(e) => setText((e.target as HTMLTextAreaElement).value)}
			/>
			<div class="preview">
				{Stream.map(remainingStream, (remaining) => (
					<span style={{ color: remaining < 20 ? "#f44336" : "#666" }}>
						{remaining} characters remaining
					</span>
				))}
			</div>
		</div>
	);
};

// ============================================================================
// Example 4: Form Submit with Effect
// ============================================================================

const LoginForm = () => {
	const [statusStream, setStatus] = createEmitter<string | null>(null);

	return (
		<form
			onsubmit={(e) => {
				e.preventDefault();
				return Effect.gen(function* () {
					setStatus("Submitting...");
					yield* Effect.log("Form submitted");
					yield* Effect.sleep("1500 millis");
					setStatus("Login successful!");
					yield* Effect.log("Login complete");
				});
			}}
		>
			<div class="form-group">
				{/* biome-ignore lint/a11y/noLabelWithoutControl: input is sibling */}
				<label>Username</label>
				<input type="text" placeholder="Enter username" />
			</div>
			<div class="form-group">
				{/* biome-ignore lint/a11y/noLabelWithoutControl: input is sibling */}
				<label>Password</label>
				<input type="password" placeholder="Enter password" />
			</div>
			<button type="submit">Login</button>
			<div class="preview">
				{Stream.map(statusStream, (status) =>
					status ? <span>{status}</span> : null,
				)}
			</div>
		</form>
	);
};

// ============================================================================
// Example 5: Live Search Preview
// ============================================================================

const SearchPreview = () => {
	const [queryStream, setQuery] = createEmitter("");

	// Simulated search results
	const resultsStream = Stream.map(queryStream, (query) => {
		if (query.length < 2) return [];
		const items = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];
		return items.filter((item) =>
			item.toLowerCase().includes(query.toLowerCase()),
		);
	});

	return (
		<div>
			<input
				type="search"
				placeholder="Search fruits..."
				oninput={(e) => setQuery((e.target as HTMLInputElement).value)}
			/>
			<div class="preview">
				{Stream.map(resultsStream, (results) =>
					results.length > 0 ? (
						<ul>
							{results.map((item) => (
								<li>{item}</li>
							))}
						</ul>
					) : (
						<span>Type at least 2 characters to search</span>
					),
				)}
			</div>
		</div>
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
		<h1>Form Handling</h1>

		<section>
			<h2>1. Basic Reactive Input</h2>
			<BasicInput />
		</section>

		<section>
			<h2>2. Email Validation</h2>
			<EmailInput />
		</section>

		<section>
			<h2>3. Character Counter</h2>
			<CharacterCounter />
		</section>

		<section>
			<h2>4. Form Submit with Effect</h2>
			<LoginForm />
		</section>

		<section>
			<h2>5. Live Search Preview</h2>
			<SearchPreview />
		</section>
	</div>
);

// biome-ignore lint/style/noNonNullAssertion: playground code, element always exists
Effect.runPromise(mount(<App />, document.getElementById("root")!));
