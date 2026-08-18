import { defineConfig } from "sqlumz";

import sequelize from "#/models/options.js";

export default defineConfig({
	sequelize,
	format: "js",
	naming: "sequence",
});
