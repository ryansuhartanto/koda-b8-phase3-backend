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
		urlHash: {
			type: DataTypes.BLOB,
			allowNull: false,
		},
		owner: {
			type: DataTypes.BIGINT,
			references: { table: "Users", key: "id" },
			onDelete: "RESTRICT",
		},
	});

	await queryInterface.addIndex("Urls", {
		fields: ["urlHash", "owner"],
		unique: true,
	});

	// null owners are distinct to a composite unique, so anonymous links need their own index
	await queryInterface.addIndex("Urls", {
		fields: ["urlHash"],
		where: { owner: null },
		unique: true,
	});
}

/** @type {import("sqlumz").MigrationFunction} */
export async function down({ sequelize: { queryInterface } }) {
	await queryInterface.dropTable("Urls");
}
