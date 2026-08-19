import sequelize from "#/models/index.js";
import { UrlOwner } from "#/models/url-owner.js";
import { Url } from "#/models/url.js";

/**
 * @param {string} code
 * @param {string} userId
 */
async function ownedId(code, userId) {
	const id = Url.decodeId(code);

	if (id === null) {
		return null;
	}

	const owner = await UrlOwner.findOne({
		where: { urlId: id, userId },
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
	const owned = await UrlOwner.findAll({ where: { userId } });

	return Url.findAll({ where: { id: owned.map(({ urlId }) => urlId) } });
}

/**
 * @param {string} code
 * @param {string} userId
 * @param {string} url
 */
export async function update(code, userId, url) {
	const id = await ownedId(code, userId);

	if (!id) {
		return null;
	}

	const record = await Url.findByPk(id);

	return (await record?.update({ url })) ?? null;
}

/**
 * @param {string} code
 * @param {string} userId
 */
export async function remove(code, userId) {
	const id = await ownedId(code, userId);

	if (!id) {
		return false;
	}

	await Url.destroy({ where: { id } });

	return true;
}
