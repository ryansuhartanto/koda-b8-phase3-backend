import { Op, QueryTypes, UniqueConstraintError } from "@sequelize/core";

import { decode, FINGERPRINT } from "#/lib/code.js";
import { digest } from "#/lib/uri.js";
import sequelize from "#/models/index.js";
import { Url } from "#/models/url.js";

// DO UPDATE, not DO NOTHING: only an update returns the stored row
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
 * @template T
 * @param {() => Promise<T>} query
 */
async function unique(query) {
	try {
		return await query();
	} catch (error) {
		if (error instanceof UniqueConstraintError) {
			return false;
		}

		throw error;
	}
}

/**
 * @param {string} code
 */
function locate(code) {
	const id = decode(code);

	return id === null ? { custom: code } : { id };
}

/**
 * @param {string} url
 * @param {string} [owner]
 * @param {string} [custom]
 */
export async function shorten(url, owner, custom) {
	const urlHash = digest(url);
	// custom paths are an owner feature
	const alias = owner === undefined ? undefined : custom;

	// false on a taken custom path
	return unique(async () => {
		const [record] = await Url.findCreateFind({
			where: { urlHash, owner: owner ?? null },
			defaults: { url, urlHash, owner, custom: alias },
		});

		// findCreateFind swallows the failed insert: a taken custom path returns no row
		if (!record) {
			return false;
		}

		return alias === undefined || record.custom === alias
			? record
			: record.update({ custom: alias });
	});
}

/**
 * @param {string} code
 */
export async function resolve(code) {
	return Url.findOne({ where: locate(code) });
}

/**
 * @param {string} owner
 * @param {number} limit
 * @param {number} offset
 * @param {string} [search]
 */
export async function list(owner, limit, offset, search) {
	// search input is literal, not a LIKE pattern
	const term = `%${search?.replaceAll(/[\\%_]/g, String.raw`\$&`)}%`;
	const id = search === undefined ? null : decode(search);

	return Url.findAndCountAll({
		where: {
			owner,
			...(search && {
				[Op.or]: [
					{ url: { [Op.iLike]: term } },
					{ custom: { [Op.iLike]: term } },
					...(id === null ? [] : [{ id }]),
				],
			}),
		},
		order: [["id", "ASC"]],
		limit,
		offset,
	});
}

/**
 * @param {string} code
 * @param {string} owner
 * @param {string} url
 * @param {string} [custom]
 */
export async function update(code, owner, url, custom) {
	// null | false | result
	return unique(async () => {
		const [, [record]] = await Url.update(
			{
				url,
				urlHash: digest(url),
				...(custom === undefined ? {} : { custom }),
			},
			{ where: { ...locate(code), owner }, returning: true },
		);

		return record ?? null;
	});
}

/**
 * @param {string} code
 * @param {string} owner
 */
export async function remove(code, owner) {
	return (await Url.destroy({ where: { ...locate(code), owner } })) > 0;
}
