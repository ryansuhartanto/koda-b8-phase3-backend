import { QueryTypes } from "@sequelize/core";

import sequelize from "#/models/index.js";
import { UrlOwner } from "#/models/url-owner.js";
import { FINGERPRINT, Url } from "#/models/url.js";

// DO UPDATE, not DO NOTHING: only an update returns the row that is already stored
const [{ fingerprint }] = /** @type {[{ fingerprint: Buffer }]} */ (
	await sequelize.query(
		`INSERT INTO "UrlConfigs" (id, fingerprint, "createdAt", "updatedAt")
		VALUES (1, $fingerprint, NOW(), NOW())
		ON CONFLICT (id) DO UPDATE SET id = 1
		RETURNING fingerprint`,
		{ bind: { fingerprint: FINGERPRINT }, type: QueryTypes.SELECT },
	)
);

if (!FINGERPRINT.equals(fingerprint)) {
	throw new Error("LINK_KEY does not match the fingerprint in UrlConfigs");
}

/**
 * @param {string} code
 * @param {string} userId
 * @param {import("@sequelize/core").Transaction} transaction
 */
async function ownedId(code, userId, transaction) {
	const id = Url.decodeId(code);

	if (id === null) {
		return null;
	}

	const owner = await UrlOwner.findOne({
		where: { urlId: id, userId },
		transaction,
		lock: true,
	});

	return owner && id;
}

/**
 * @param {string} url
 * @param {string} userId
 */
export async function shorten(url, userId) {
	return sequelize.transaction(async (transaction) => {
		const created = await Url.create({ url }, { transaction });
		await UrlOwner.create(
			{ urlId: String(created.id), userId },
			{ transaction },
		);

		return created;
	});
}

/**
 * @param {string} code
 */
export async function resolve(code) {
	const id = Url.decodeId(code);

	return id === null ? null : Url.findByPk(id);
}

/**
 * @param {string} userId
 */
export async function list(userId) {
	return Url.findAll({
		include: { model: UrlOwner, where: { userId }, attributes: [] },
	});
}

/**
 * @param {string} code
 * @param {string} userId
 * @param {string} url
 */
export async function update(code, userId, url) {
	return sequelize.transaction(async (transaction) => {
		const id = await ownedId(code, userId, transaction);

		if (!id) {
			return null;
		}

		const [, [record]] = await Url.update(
			{ url },
			{ where: { id }, returning: true, transaction },
		);

		return record ?? null;
	});
}

/**
 * @param {string} code
 * @param {string} userId
 */
export async function remove(code, userId) {
	return sequelize.transaction(async (transaction) => {
		const id = await ownedId(code, userId, transaction);

		if (!id) {
			return false;
		}

		await Url.destroy({ where: { id }, transaction });

		return true;
	});
}
