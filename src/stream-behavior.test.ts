import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { Effect, Stream } from "effect";

describe("Stream.make behavior", () => {
	it("should emit values sequentially with runForEach", async () => {
		const emittedValues: string[] = [];

		const stream = Stream.make("first", "second", "third");

		await Effect.runPromise(
			Stream.runForEach(stream, (value) =>
				Effect.sync(() => {
					console.log(`Emitted: ${value}`);
					emittedValues.push(value);
				})
			)
		);

		console.log("All emitted values:", emittedValues);
		assert.deepEqual(emittedValues, ["first", "second", "third"]);
	});

	it("should emit all values to runForEach even with delays", async () => {
		const emittedValues: string[] = [];
		let emissionTimes: number[] = [];
		const startTime = Date.now();

		const stream = Stream.make("first", "second", "third");

		await Effect.runPromise(
			Stream.runForEach(stream, (value) =>
				Effect.sync(() => {
					const elapsed = Date.now() - startTime;
					console.log(`Emitted '${value}' at ${elapsed}ms`);
					emittedValues.push(value);
					emissionTimes.push(elapsed);
				})
			)
		);

		console.log("Emission times:", emissionTimes);
		console.log("All emitted values:", emittedValues);

		// All emissions should happen nearly simultaneously
		const maxTimeDiff = Math.max(...emissionTimes) - Math.min(...emissionTimes);
		console.log("Max time difference between emissions:", maxTimeDiff, "ms");

		assert.deepEqual(emittedValues, ["first", "second", "third"]);
		// They should all emit within a few milliseconds of each other
		assert.ok(maxTimeDiff < 50, `Emissions took ${maxTimeDiff}ms, expected < 50ms`);
	});
});