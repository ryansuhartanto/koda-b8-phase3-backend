import { DataTypes, Model } from "@sequelize/core";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import sequelize from "#/models/index.js";

const { JWT_SECRET } = process.env;
const JWT_EXPIRES_IN = "24h";

if (!JWT_SECRET) {
	throw new Error("JWT_SECRET is not set");
}

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

	signToken() {
		return jwt.sign(this.email, /** @type {string} */ (JWT_SECRET), {
			expiresIn: JWT_EXPIRES_IN,
		});
	}

	/**
	 * @param {string} token
	 */
	static verifyToken(token) {
		try {
			return jwt.verify(token, /** @type {string} */ (JWT_SECRET));
		} catch {
			return null;
		}
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
