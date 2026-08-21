import { constants } from "node:http2";

import * as Service from "#/services/auth.js";

/**
 * @openapi
 * tags:
 *   - name: auth
 * components:
 *   schemas:
 *     Credentials:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email, example: user@example.com }
 *         password: { type: string, minLength: 6, example: correct-horse-battery-staple }
 *     Auth:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             email: { type: string, format: email, example: user@example.com }
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJzdWIiOiIxIn0.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_LENGTH = 6;

/**
 * @param {Partial<AuthQuery>} body
 * @returns {AuthResult?}
 */
function credentials({ email, password }) {
	/** @type {AuthResult} */
	const errors = {};

	if (!email) {
		errors.email = "Missing email field";
	} else if (!EMAIL.test(email)) {
		errors.email = "Invalid email";
	}

	if (!password) {
		errors.password = "Missing password field";
	} else if (password.length < PASSWORD_LENGTH) {
		errors.password = `Password must be at least ${PASSWORD_LENGTH} characters`;
	}

	return Object.keys(errors).length > 0 ? errors : null;
}

/** @type {import("express").RequestHandler<{}, import("./type").Result<AuthResult, any>, AuthQuery>} */
export const login = async (req, res) => {
	const { email, password } = req.body ?? {};
	const errors = credentials(req.body ?? {});

	if (errors) {
		return res.status(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY).json({
			success: false,
			message: "Missing fields",
			results: errors,
		});
	}

	const auth = await Service.login(email, password);

	if (!auth) {
		return res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
			success: false,
			message: "Invalid credentials",
			results:
				auth === null
					? { email: "Email is not registered" }
					: { password: "Password is incorrect" },
		});
	}

	return res.json({
		success: true,
		message: "Authenticated",
		results: auth,
	});
};

/** @type {import("express").RequestHandler<{}, import("./type").Result<AuthResult, any>, AuthQuery>} */
export const register = async (req, res) => {
	const { email, password } = req.body ?? {};
	const errors = credentials(req.body ?? {});

	if (errors) {
		return res.status(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY).json({
			success: false,
			message: "Missing fields",
			results: errors,
		});
	}

	const auth = await Service.register(email, password);

	if (!auth) {
		return res.status(constants.HTTP_STATUS_CONFLICT).json({
			success: false,
			message: "Email is already registered",
			results: { email: "Email is already registered" },
		});
	}

	return res.json({
		success: true,
		message: "Registered",
		results: auth,
	});
};
