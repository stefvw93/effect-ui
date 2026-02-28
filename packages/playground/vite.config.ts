import { defineConfig } from "vite";

export default defineConfig({
	esbuild: {
		jsx: "transform",
		jsxDev: false,
		jsxImportSource: "@effect-ui/jsx-runtime",
		jsxInject: `import { jsx, Fragment } from '@effect-ui/jsx-runtime'`,
		jsxFactory: "jsx",
		jsxFragment: "Fragment",
	},
	server: {
		port: 3000,
		open: true,
	},
});
