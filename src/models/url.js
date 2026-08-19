import { DataTypes, Model } from "@sequelize/core";

import sequelize from "#/models/index.js";

// Feistel chipher over a Crockford's base32
// oxlint-disable no-bitwise
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_LENGTH = 10;
const HALF_BITS = 25n;
const HALF_MASK = 0x1ffffff;
const ROUND_KEYS = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a];

/**
 * @param {number} value
 * @param {number} key
 */
function round(value, key) {
	let x = Math.imul(value ^ key, 0x2545f491) >>> 0;
	x = Math.imul(x ^ (x >>> 15), 0x9e3779b1) >>> 0;
	return (x ^ (x >>> 13)) & HALF_MASK;
}

/**
 * @param {bigint} value
 */
function encipher(value) {
	let left = Number((value >> HALF_BITS) & BigInt(HALF_MASK));
	let right = Number(value & BigInt(HALF_MASK));

	for (const key of ROUND_KEYS) {
		[left, right] = [right, left ^ round(right, key)];
	}

	return (BigInt(left) << HALF_BITS) | BigInt(right);
}

/**
 * @param {bigint} value
 */
function decipher(value) {
	let left = Number((value >> HALF_BITS) & BigInt(HALF_MASK));
	let right = Number(value & BigInt(HALF_MASK));

	for (const key of ROUND_KEYS.toReversed()) {
		[left, right] = [right ^ round(left, key), left];
	}

	return (BigInt(left) << HALF_BITS) | BigInt(right);
}

/**
 * @param {bigint} value
 */
function encode(value) {
	let code = "";

	for (let i = CODE_LENGTH - 1; i >= 0; i--) {
		code += ALPHABET[Number((value >> BigInt(i * 5)) & 31n)];
	}

	return code;
}

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

	encoded() {
		const id = BigInt(this.id);

		if (id >> (HALF_BITS * 2n)) {
			throw new RangeError("id is outside the 50 bit short code space");
		}

		return encode(encipher(id));
	}

	/**
	 * @override
	 */
	toJSON() {
		const { id: _, ...rest } = super.toJSON();
		return { ...rest, encoded: this.encoded() };
	}

	/**
	 * @param {string} code
	 * @returns {bigint?}
	 */
	static decodeId(code) {
		// Crockford: hyphens are decoration, O reads as 0, I and L read as 1
		const normalized = code
			.replaceAll("-", "")
			.toUpperCase()
			.replaceAll("O", "0")
			.replaceAll(/[IL]/g, "1");

		if (normalized.length !== CODE_LENGTH) {
			return null;
		}

		let value = 0n;

		for (const character of normalized) {
			const index = ALPHABET.indexOf(character);

			if (index === -1) {
				return null;
			}

			value = (value << 5n) | BigInt(index);
		}

		return decipher(value);
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
	},
	{
		sequelize,
	},
);
