import oxfmt from "@kekkon-nexus/config/oxfmt";
import oxlint from "@kekkon-nexus/config/oxlint";
import { defineConfig, loadEnv } from "vite-plus";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	process.env = env;

	return {
		fmt: {
			...oxfmt,
		},
		lint: {
			extends: [oxlint],
			jsPlugins: [
				{
					name: "vite-plus",
					specifier: "vite-plus/oxlint-plugin",
				},
				{
					name: "no-relative-import-paths",
					specifier: "eslint-plugin-no-relative-import-paths",
				},
			],

			rules: {
				"vite-plus/prefer-vite-plus-imports": "error",
				"no-relative-import-paths/no-relative-import-paths": [
					"warn",
					{ allowSameFolder: false, rootDir: `/src`, prefix: "#" },
				],
			},

			options: {
				typeAware: true,
				typeCheck: true,
			},
		},
		staged: {
			"*": "vp check --fix --no-error-on-unmatched-pattern",
		},

		pack: {
			entry: "src/app.js",
			sourcemap: true,
		},
	};
});
