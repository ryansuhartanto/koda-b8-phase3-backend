import { DataTypes, Model } from "@sequelize/core";

import sequelize from "#/models/index.js";
import { Url } from "#/models/url.js";

/**
 * @extends {Model<import("@sequelize/core").InferAttributes<UrlOwner>, import("@sequelize/core").InferCreationAttributes<UrlOwner>> }
 */
export class UrlOwner extends Model {
	/**
	 * @type {string}
	 */
	urlId;

	/**
	 * @type {string}
	 */
	userId;
}

/** @type {typeof UrlOwner.init<UrlOwner, typeof UrlOwner>} */ (UrlOwner.init)(
	{
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
	},
	{
		sequelize,
	},
);

Url.hasMany(UrlOwner, { foreignKey: "urlId", inverse: { as: "url" } });
