import { PostgresDialect } from "@sequelize/postgres";

/** @type {import("@sequelize/core").Options<PostgresDialect>} */
const options = {
	dialect: PostgresDialect,
	url: process.env["POSTGRES_URL"],
};

export default options;
