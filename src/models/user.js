import { DataTypes, Model } from "@sequelize/core";
import {
	Attribute,
	PrimaryKey,
	AutoIncrement,
	NotNull,
} from "@sequelize/core/decorators-legacy";

/**
 * @extends {Model<import("@sequelize/core").InferAttributes<User>, import("@sequelize/core").InferCreationAttributes<User>> }
 */
export class User extends Model {
	/**
	 * @type {import("@sequelize/core").CreationOptional<number>}
	 */
	@Attribute(DataTypes.INTEGER)
	@PrimaryKey
	@AutoIncrement
	id;

	/**
	 * @type {string}
	 */
	@Attribute(DataTypes.STRING)
	@NotNull
	email;

	/**
	 * @type {string}
	 */
	@Attribute(DataTypes.STRING)
	@NotNull
	password;
}
