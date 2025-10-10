import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	esbuild: {
		jsx: "transform",
		jsxDev: false,
		jsxImportSource: "~",
		jsxInject: `import { jsx, Fragment } from '~/jsx-runtime'`,
		jsxFactory: "jsx",
		jsxFragment: "Fragment",
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"~": path.resolve(__dirname, "."),
			"~/jsx-runtime": path.resolve(__dirname, "./jsx-runtime/index.ts"),
		},
	},
	server: {
		port: 3000,
		open: true,
	},
});
