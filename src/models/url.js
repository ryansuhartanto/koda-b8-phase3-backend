import { DataTypes, Model } from "@sequelize/core";

import { encode } from "#/lib/code.js";
import sequelize from "#/models/index.js";

/**
 * @extends {Model<import("@sequelize/core").InferAttributes<Url>, import("@sequelize/core").InferCreationAttributes<Url>> }
 */
export class Url extends Model {
	/**
	 * @type {import("@sequelize/core").CreationOptional<number>}
	 */
	id;

	/**
	 * @type {string}
	 */
	url;

	/**
	 * @type {Buffer}
	 */
	hash;

	/**
	 * @type {string?}
	 */
	owner;

	encoded() {
		return encode(BigInt(this.id));
	}

	/**
	 * @override
	 */
	toJSON() {
		const { id: _, hash: __, owner: ___, ...rest } = super.toJSON();
		return { ...rest, encoded: this.encoded() };
	}
}

/** @type {typeof Url.init<Url, typeof Url>} */ (Url.init)(
	{
		id: {
			primaryKey: true,
			autoIncrement: true,
			autoIncrementIdentity: true,
			type: DataTypes.BIGINT,
		},
		url: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		hash: {
			type: DataTypes.BLOB,
			allowNull: false,
		},
		owner: {
			type: DataTypes.BIGINT,
			references: { table: "Users", key: "id" },
			onDelete: "RESTRICT",
		},
	},
	{
		sequelize,
	},
);
