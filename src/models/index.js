import path from "node:path";

import { Sequelize, importModels } from "@sequelize/core";

import options from "#/models/options.js";

const dir = import.meta.dirname;

const sequelize = new Sequelize({
	...options,
	models: await importModels([path.join(dir, "/*.js")]),
});

export default sequelize;
