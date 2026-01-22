import { Effect, Stream } from "effect";
import { mount } from "@/api";

const A = (props: { label: string }) =>
	Stream.concat(
		Stream.make("?"),
		Stream.fromEffect(
			Effect.gen(function* () {
				const delay = Math.floor(Math.random() * 2000) + 1000;
				yield* Effect.sleep(delay);
				return props.label;
			}),
		),
	);

const App = () => (
	<div style={{ fontFamily: "monospace" }}>
		{Array.from({ length: 10 }, (_, i) => i).map((i) => (
			<A label={`${i}`} />
		))}
	</div>
);

Effect.runPromise(mount(<App />, document.body));
