import { DataTypes } from "@sequelize/core";

/** @type {import("sqlumz").MigrationFunction} */
export async function up({ sequelize: { queryInterface } }) {
	await queryInterface.createTable("Users", {
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
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
}

/** @type {import("sqlumz").MigrationFunction} */
export async function down({ sequelize: { queryInterface } }) {
	await queryInterface.dropTable("Users");
}
