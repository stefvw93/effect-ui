import { Console, Effect, Stream } from "effect";
import { mount } from "@/api";

const A = (props: { label: string }) =>
	Stream.concat(
		Stream.make("?"),
		Stream.fromEffect(
			Effect.promise(
				() =>
					new Promise<string>((resolve) => {
						const delay = Math.floor(Math.random() * 2000) + 1000; // 1000-3000 ms
						setTimeout(() => resolve(props.label), delay);
					}),
			),
		),
	);

const App = () =>
	Effect.gen(function* () {
		yield* Console.log("App");
		return (
			<div style={{ fontFamily: "monospace" }}>
				{Array.from({ length: 10 }, (_, i) => i).map((i) => (
					<A label={`${i}`} />
				))}
			</div>
		);
	});

Effect.runPromise(mount(<App />, document.body));
