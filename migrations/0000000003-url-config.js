import { DataTypes } from "@sequelize/core";

/** @type {import("sqlumz").MigrationFunction} */
export async function up({ sequelize, sequelize: { queryInterface } }) {
	await queryInterface.createTable("UrlConfigs", {
		id: {
			primaryKey: true,
			type: DataTypes.SMALLINT,
			defaultValue: 1,
		},
		createdAt: {
			allowNull: false,
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
		updatedAt: {
			allowNull: false,
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
		fingerprint: {
			type: DataTypes.BLOB,
			allowNull: false,
		},
	});

	await sequelize.query(
		'ALTER TABLE "UrlConfigs" ADD CONSTRAINT "UrlConfigs_singleton" CHECK (id = 1)',
	);
}

/** @type {import("sqlumz").MigrationFunction} */
export async function down({ sequelize: { queryInterface } }) {
	await queryInterface.dropTable("UrlConfigs");
}
