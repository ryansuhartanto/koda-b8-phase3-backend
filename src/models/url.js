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
	urlHash;

	/**
	 * @type {string?}
	 */
	owner;

	/**
	 * @type {string?}
	 */
	custom;

	encoded() {
		return this.custom ?? encode(BigInt(this.id));
	}

	/**
	 * @override
	 */
	toJSON() {
		const {
			id: _,
			urlHash: __,
			owner: ___,
			custom: ____,
			...rest
		} = super.toJSON();
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
		urlHash: {
			type: DataTypes.BLOB,
			allowNull: false,
		},
		owner: {
			type: DataTypes.BIGINT,
			references: { table: "Users", key: "id" },
			onDelete: "RESTRICT",
		},
		custom: {
			type: DataTypes.TEXT,
			unique: true,
		},
	},
	{
		sequelize,
	},
);
