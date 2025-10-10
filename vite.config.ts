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
			"@": new URL("./src", import.meta.url).pathname,
			"~": new URL(".", import.meta.url).pathname,
			"~/jsx-runtime": new URL("./jsx-runtime/index.ts", import.meta.url)
				.pathname,
		},
	},
	server: {
		port: 3000,
		open: true,
	},
});
