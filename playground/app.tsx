import { Context, Effect, Layer, Stream } from "effect";
import { mount } from "@/api";

const MyValue = Context.GenericTag<{ value: string }>("MyService");

const MyValueLayer = Layer.succeed(MyValue, { value: "Hello, world!" });

const A = (props: { label: string }) =>
	Stream.concat(
		Stream.make("?"),
		Stream.fromEffect(
			Effect.gen(function* () {
				const value = yield* MyValue;
				const delay = Math.floor(Math.random() * 2000) + 1000;
				yield* Effect.sleep(delay);
				return `${props.label}:${value.value}`;
			}),
		),
	);

const App = () => (
	<div style={{ fontFamily: "monospace" }}>
		<div style={{ marginBottom: "1rem" }}>
			<a href="./recipes/">View Recipes &rarr;</a>
		</div>
		{Array.from({ length: 10 }, (_, i) => i).map((i) => (
			<A label={`${i}`} />
		))}
	</div>
);

Effect.runPromise(
	mount(<App />, document.body).pipe(Effect.provide(MyValueLayer)),
);
