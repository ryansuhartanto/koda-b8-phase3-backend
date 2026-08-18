import { User } from "#/models/user.js";

/**
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
	let auth;

	const user = await User.withScope("withPassword")
		.afterFind(async (result) => {
			const user = /** @type {User?} */ (result);
			auth = (await user?.verifyPassword(password)) ?? false;
		})
		.findOne({
			where: { email },
		});

	if (user) {
		// @ts-ignore
		user.password = undefined;
	}

	// null | false | User
	return user && auth && user;
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

	return created && user;
}
