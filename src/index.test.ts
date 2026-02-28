import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EffectUIRuntime, mount, renderToString } from ".";

describe("Main exports", () => {
	it("should export EffectUIRuntime", () => {
		assert.ok(EffectUIRuntime);
		assert.equal(typeof EffectUIRuntime, "function");
	});

	it("should export mount function", () => {
		assert.ok(mount);
		assert.equal(typeof mount, "function");
	});

	it("should export renderToString function", () => {
		assert.ok(renderToString);
		assert.equal(typeof renderToString, "function");
	});
});
