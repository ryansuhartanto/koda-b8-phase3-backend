import { constants } from "node:http2";

import * as Service from "#/services/auth.js";

/**
 * @openapi
 * tags:
 *   - name: auth
 *     description: Registration and login
 * components:
 *   schemas:
 *     Credentials:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email }
 *         password: { type: string }
 *     Auth:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             email: { type: string, format: email }
 *         token: { type: string }
 */

/**
 * @typedef AuthQuery
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef AuthResult
 * @property {string} [email]
 * @property {string} [password]
 */

/** @type {import("express").RequestHandler<{}, import("./type").Result<AuthResult, any>, AuthQuery>} */
export const login = async (req, res) => {
	const { email, password } = req.body ?? {};
	/** @type {AuthResult} */
	const errors = {};

	if (!email) {
		errors.email = "Missing email field";
	}
	if (!password) {
		errors.password = "Missing password field";
	}

	if (Object.keys(errors).length > 0) {
		return res.status(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY).json({
			success: false,
			message: "Missing fields",
			result: errors,
		});
	}

	const auth = await Service.login(email, password);

	if (!auth) {
		if (auth === null) {
			errors.email = "Email is not registered";
		} else {
			errors.password = "Password is incorrect";
		}

		return res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
			success: false,
			message: "Invalid credentials",
			result: errors,
		});
	}

	return res.json({
		success: true,
		message: "Authenticated",
		result: auth,
	});
};

/** @type {import("express").RequestHandler<{}, import("./type").Result<AuthResult, any>, AuthQuery>} */
export const register = async (req, res) => {
	const { email, password } = req.body ?? {};
	/** @type {AuthResult} */
	const errors = {};

	if (!email) {
		errors.email = "Missing email field";
	}
	if (!password) {
		errors.password = "Missing password field";
	}

	if (Object.keys(errors).length > 0) {
		return res.status(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY).json({
			success: false,
			message: "Missing fields",
			result: errors,
		});
	}

	const auth = await Service.register(email, password);

	if (!auth) {
		errors.email = "Email is already registered";

		return res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
			success: false,
			message: errors.email,
			result: errors,
		});
	}

	return res.json({
		success: true,
		message: "Registered",
		result: auth,
	});
};
