import { mount } from "@effect-ui/dom";
import {
	Context,
	Effect,
	Layer,
	Option,
	pipe,
	Stream,
	SubscriptionRef,
} from "effect";

const MyValue = Context.GenericTag<{ value: string }>("MyService");

const MyValueLayer = Layer.succeed(MyValue, { value: "Hello, world!" });

const A = (props: { label: string }) =>
	Stream.concat(
		Stream.make("?"),
		Stream.fromEffect(
			Effect.gen(function* () {
				const delay = Math.floor(Math.random() * 2000) + 1000;
				const ref = yield* SubscriptionRef.make<Option.Option<HTMLSpanElement>>(
					Option.none(),
				);

				yield* pipe(
					ref.changes,
					Stream.filter(Option.isSome),
					Stream.runForEach((option) =>
						Option.tap(option, (value) => {
							console.log("tap", { value });
							return Option.some(value);
						}),
					),
					Effect.fork,
				);

				yield* Effect.sleep(delay);

				return <span ref={ref}>{props.label}</span>;
			}),
		),
	);

const App = () => {
	return (
		<div style={{ fontFamily: "monospace" }}>
			<div style={{ marginBottom: "1rem" }}>
				<a href="./recipes/">View Recipes &rarr;</a>
			</div>
			{Array.from({ length: 10 }, (_, i) => i).map((i) => (
				<A label={`${i}`} />
			))}
		</div>
	);
};

Effect.runPromise(
	mount(<App />, document.body).pipe(Effect.provide(MyValueLayer)),
);
