import { DataTypes, Model } from "@sequelize/core";
import * as bcrypt from "bcryptjs";

import sequelize from "#/models/index.js";

/**
 * @extends {Model<import("@sequelize/core").InferAttributes<User>, import("@sequelize/core").InferCreationAttributes<User>> }
 */
export class User extends Model {
	/**
	 * @type {import("@sequelize/core").CreationOptional<number>}
	 */
	id;

	/**
	 * @type {string}
	 */
	email;

	/**
	 * @type {string}
	 */
	password;

	/**
	 *
	 * @param {string} password
	 */
	async verifyPassword(password) {
		return bcrypt.compare(password, this.password);
	}
}

/** @type {typeof User.init<User, typeof User>} */ (User.init)(
	{
		id: {
			primaryKey: true,
			autoIncrement: true,
			autoIncrementIdentity: true,
			type: DataTypes.BIGINT,
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
	},
	{
		sequelize,
		defaultScope: {
			attributes: { exclude: ["id", "password"] },
		},
		scopes: {
			withPassword: {
				attributes: { exclude: [] },
			},
		},

		hooks: {
			beforeCreate: async (user) => {
				user.password = await bcrypt.hash(user.password, 10);
			},
			beforeUpdate: async (user) => {
				if (user.changed("password")) {
					user.password = await bcrypt.hash(user.password, 10);
				}
			},
		},
	},
);
