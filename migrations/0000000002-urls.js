import { DataTypes } from "@sequelize/core";

/** @type {import("sqlumz").MigrationFunction} */
export async function up({ sequelize: { queryInterface } }) {
	await queryInterface.createTable("Urls", {
		id: {
			primaryKey: true,
			autoIncrement: true,
			autoIncrementIdentity: true,
			type: DataTypes.BIGINT,
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
		url: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	});

	await queryInterface.createTable("UrlOwners", {
		urlId: {
			primaryKey: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			references: { table: "Urls", key: "id" },
			onDelete: "CASCADE",
		},
		userId: {
			primaryKey: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			references: { table: "Users", key: "id" },
			onDelete: "CASCADE",
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
	});
}

/** @type {import("sqlumz").MigrationFunction} */
export async function down({ sequelize: { queryInterface } }) {
	await queryInterface.dropTable("UrlOwners");
	await queryInterface.dropTable("Urls");
}
