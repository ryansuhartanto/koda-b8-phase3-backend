import { DataTypes } from "@sequelize/core";

/** @type {import("sqlumz").MigrationFunction} */
export async function up({ sequelize: { queryInterface } }) {
	await queryInterface.addColumn("Urls", "custom", {
		type: DataTypes.TEXT,
	});

	await queryInterface.addIndex("Urls", {
		fields: ["custom"],
		unique: true,
	});
}

/** @type {import("sqlumz").MigrationFunction} */
export async function down({ sequelize: { queryInterface } }) {
	await queryInterface.removeColumn("Urls", "custom");
}
