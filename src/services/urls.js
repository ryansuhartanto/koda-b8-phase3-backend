import { QueryTypes } from "@sequelize/core";

import { decode, FINGERPRINT } from "#/lib/code.js";
import { digest } from "#/lib/uri.js";
import sequelize from "#/models/index.js";
import { Url } from "#/models/url.js";

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
 * @param {string} url
 * @param {string} [owner]
 */
export async function shorten(url, owner) {
	const hash = digest(url);
	const [record] = await Url.findCreateFind({
		where: { hash, owner: owner ?? null },
		defaults: { url, hash, owner },
	});

	return record;
}

/**
 * @param {string} code
 */
export async function resolve(code) {
	const id = decode(code);

	return id === null ? null : Url.findByPk(id);
}

/**
 * @param {string} owner
 */
export async function list(owner) {
	return Url.findAll({ where: { owner } });
}

/**
 * @param {string} code
 * @param {string} owner
 * @param {string} url
 */
export async function update(code, owner, url) {
	const id = decode(code);

	if (id === null) {
		return null;
	}

	const [, [record]] = await Url.update(
		{ url, hash: digest(url) },
		{ where: { id, owner }, returning: true },
	);

	return record ?? null;
}

/**
 * @param {string} code
 * @param {string} owner
 */
export async function remove(code, owner) {
	const id = decode(code);

	return id !== null && (await Url.destroy({ where: { id, owner } })) > 0;
}
