import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/**/*.{ts,tsx}", "!src/**/*.test.{ts,tsx}"],
	outDir: "dist",
	dts: true,
	platform: "node",
	minify: true,
	external: ["effect", /^@effect-ui\//],
});
