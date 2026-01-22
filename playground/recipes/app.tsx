/**
 * Recipe Navigation Hub
 *
 * Lists all available effect-ui recipes with links to individual recipe pages.
 */

import { Effect } from "effect";
import { mount } from "@/api";

const recipes = [
	{
		slug: "type-augmentation",
		name: "Type Augmentation",
		description:
			"Register app-level Effect context types with JSX type system for compile-time verification",
	},
	{
		slug: "declarative-event-handlers",
		name: "Declarative Event Handlers",
		description:
			"Event handlers that can be plain callbacks, Effects, or Streams with service access",
	},
	{
		slug: "reactive-styles",
		name: "Reactive Styles",
		description:
			"Stream-based style updates, object form styles, and theme switching patterns",
	},
	{
		slug: "async-data-loading",
		name: "Async Data Loading",
		description:
			"Effect-returning components with loading states and error handling",
	},
	{
		slug: "form-handling",
		name: "Form Handling",
		description:
			"Stream-based inputs, reactive validation, and Effect-powered submit handlers",
	},
	{
		slug: "list-rendering",
		name: "List Rendering",
		description:
			"Fragment usage, array mapping, and dynamic lists from streams",
	},
	{
		slug: "subscription-ref",
		name: "SubscriptionRef (Signals)",
		description:
			"SolidJS-like reactive state with SubscriptionRef and .changes streams",
	},
];

const RecipeCard = ({
	slug,
	name,
	description,
}: {
	slug: string;
	name: string;
	description: string;
}) => (
	<a href={`./${slug}/`} class="recipe-card">
		<h2>{name}</h2>
		<p>{description}</p>
	</a>
);

const App = () => (
	<div>
		<a href="../" class="back-link">
			&larr; Back to Playground
		</a>
		<h1>Effect UI Recipes</h1>
		<p class="subtitle">
			Interactive examples demonstrating effect-ui patterns
		</p>
		<div class="recipe-grid">
			{recipes.map((r) => (
				<RecipeCard slug={r.slug} name={r.name} description={r.description} />
			))}
		</div>
	</div>
);

// biome-ignore lint/style/noNonNullAssertion: playground code, element always exists
Effect.runPromise(mount(<App />, document.getElementById("root")!));
