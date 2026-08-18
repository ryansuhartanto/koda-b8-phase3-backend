import { Sequelize } from "@sequelize/core";

import options from "#/models/options.js";

const sequelize = new Sequelize({
	...options,
});

export default sequelize;
