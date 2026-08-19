import { User } from "#/models/user.js";

export const { verifyToken } = User;

/**
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
	let auth = /** @type {boolean} */ (false);

	const user = await User.withScope("withPassword")
		.afterFind(async (result) => {
			const user = /** @type {User?} */ (result);
			if (user) {
				auth = await user.verifyPassword(password);
			}
		})
		.findOne({
			where: { email },
		});

	if (user) {
		// @ts-ignore
		user.password = undefined;
	}

	// null | false | result
	return user && auth && { user, token: user.signToken() };
}

/**
 * @param {string} email
 * @param {string} password
 */
export async function register(email, password) {
	const [user, created] = await User.findOrCreate({
		where: {
			email,
		},
		defaults: {
			email,
			password,
		},
	});

	// false | result
	return created && { user, token: user.signToken() };
}
