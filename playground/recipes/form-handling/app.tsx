/**
 * Recipe: Form Handling
 *
 * This recipe demonstrates reactive form handling with stream-based inputs,
 * validation, and Effect-powered submit handlers.
 */

import { Effect, Either, Schema, Stream } from "effect";
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
// Example 2: Schema Validation
// ============================================================================

// Define a Schema for email validation
const Email = Schema.String.pipe(
	Schema.filter((s) => s.length > 0, { message: () => "Email is required" }),
	Schema.filter((s) => s.includes("@"), { message: () => "Must contain @" }),
	Schema.filter((s) => s.includes("."), {
		message: () => "Must contain a domain",
	}),
);

const SchemaEmailInput = () => {
	const [emailStream, setEmail] = createEmitter("");

	// Validate using Schema.decodeUnknownEither
	const validationStream = Stream.map(emailStream, (email) => {
		if (email.length === 0) return { valid: false, error: null };
		const result = Schema.decodeUnknownEither(Email)(email);
		return Either.match(result, {
			onLeft: (e) => ({
				valid: false,
				error: e.message.split(":").pop()?.trim() ?? "Invalid",
			}),
			onRight: () => ({ valid: true, error: null }),
		});
	});

	return (
		<div class="form-group">
			{/* biome-ignore lint/a11y/noLabelWithoutControl: input is sibling */}
			<label>Email (Schema validated)</label>
			<input
				type="email"
				placeholder="user@example.com"
				oninput={(e) => setEmail((e.target as HTMLInputElement).value)}
			/>
			<div>
				{Stream.map(validationStream, ({ valid, error }) =>
					error ? (
						<span class="error-text">{error}</span>
					) : valid ? (
						<span class="success-text">Valid email</span>
					) : null,
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
// Example 5: Complete Form with Schema Validation
// ============================================================================

// Define schemas for each field
const Username = Schema.String.pipe(
	Schema.filter((s) => s.length >= 3, {
		message: () => "Min 3 characters",
	}),
	Schema.filter((s) => /^[a-zA-Z0-9_]+$/.test(s), {
		message: () => "Only letters, numbers, underscore",
	}),
);

const Password = Schema.String.pipe(
	Schema.filter((s) => s.length >= 8, {
		message: () => "Min 8 characters",
	}),
	Schema.filter((s) => /[A-Z]/.test(s), {
		message: () => "Must contain uppercase",
	}),
	Schema.filter((s) => /[0-9]/.test(s), {
		message: () => "Must contain number",
	}),
);

const Age = Schema.String.pipe(
	Schema.filter((s) => /^\d+$/.test(s), {
		message: () => "Must be a number",
	}),
	Schema.transform(Schema.Number, {
		decode: (s) => Number.parseInt(s, 10),
		encode: (n) => String(n),
	}),
	Schema.filter((n) => n >= 18, { message: () => "Must be 18 or older" }),
	Schema.filter((n) => n <= 120, { message: () => "Invalid age" }),
);

// Helper to validate a field
const validateField = <A, I>(schema: Schema.Schema<A, I>, value: I) => {
	const result = Schema.decodeUnknownEither(schema)(value);
	return Either.match(result, {
		onLeft: (e) => e.message.split(":").pop()?.trim() ?? "Invalid",
		onRight: () => null,
	});
};

const SchemaForm = () => {
	const [usernameStream, setUsername] = createEmitter("");
	const [passwordStream, setPassword] = createEmitter("");
	const [ageStream, setAge] = createEmitter("");
	const [statusStream, setStatus] = createEmitter<string | null>(null);

	const usernameError = Stream.map(usernameStream, (v) =>
		v ? validateField(Username, v) : null,
	);
	const passwordError = Stream.map(passwordStream, (v) =>
		v ? validateField(Password, v) : null,
	);
	const ageError = Stream.map(ageStream, (v) =>
		v ? validateField(Age, v) : null,
	);

	// Check if form is valid (all fields filled and no errors)
	const isValid = Stream.zipLatestWith(
		Stream.zipLatestWith(usernameStream, passwordStream, (u, p) => ({
			u,
			p,
		})),
		ageStream,
		({ u, p }, a) =>
			u.length > 0 &&
			p.length > 0 &&
			a.length > 0 &&
			!validateField(Username, u) &&
			!validateField(Password, p) &&
			!validateField(Age, a),
	);

	return (
		<form
			onsubmit={(e) => {
				e.preventDefault();
				return Effect.gen(function* () {
					setStatus("Validating...");
					yield* Effect.sleep("500 millis");
					setStatus("Registration successful!");
				});
			}}
		>
			<div class="form-group">
				{/* biome-ignore lint/a11y/noLabelWithoutControl: input is sibling */}
				<label>Username</label>
				<input
					type="text"
					placeholder="min 3 chars, alphanumeric"
					oninput={(e) => setUsername((e.target as HTMLInputElement).value)}
				/>
				{Stream.map(usernameError, (err) =>
					err ? <span class="error-text">{err}</span> : null,
				)}
			</div>
			<div class="form-group">
				{/* biome-ignore lint/a11y/noLabelWithoutControl: input is sibling */}
				<label>Password</label>
				<input
					type="password"
					placeholder="min 8 chars, uppercase + number"
					oninput={(e) => setPassword((e.target as HTMLInputElement).value)}
				/>
				{Stream.map(passwordError, (err) =>
					err ? <span class="error-text">{err}</span> : null,
				)}
			</div>
			<div class="form-group">
				{/* biome-ignore lint/a11y/noLabelWithoutControl: input is sibling */}
				<label>Age</label>
				<input
					type="text"
					placeholder="18+"
					oninput={(e) => setAge((e.target as HTMLInputElement).value)}
				/>
				{Stream.map(ageError, (err) =>
					err ? <span class="error-text">{err}</span> : null,
				)}
			</div>
			<button type="submit">
				{Stream.map(isValid, (valid) =>
					valid ? "Register" : "Fill all fields",
				)}
			</button>
			<div class="preview">
				{Stream.map(statusStream, (status) =>
					status ? <span>{status}</span> : null,
				)}
			</div>
		</form>
	);
};

// ============================================================================
// Example 6: Live Search Preview
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
			<h2>2. Schema Validation</h2>
			<SchemaEmailInput />
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
			<h2>5. Complete Schema Form</h2>
			<SchemaForm />
		</section>

		<section>
			<h2>6. Live Search Preview</h2>
			<SearchPreview />
		</section>
	</div>
);

// biome-ignore lint/style/noNonNullAssertion: playground code, element always exists
Effect.runPromise(mount(<App />, document.getElementById("root")!));
