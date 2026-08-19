/**
 * @typedef {null} AuthMiddlewareResult
 */

/**
 * @typedef AuthMiddlewareBody
 * @property {string} userId
 */

import { User } from "#/models/user.js";

/**
 * @type {import("express").RequestHandler<AuthMiddlewareBody, import("../controllers/type.js").Result<AuthMiddlewareResult>, AuthMiddlewareBody>}
 * @returns {any}
 */
const auth = (req, res, next) => {
	const auth = req.headers.authorization;
	if (!auth) {
		return res.status(401).json({
			success: false,
			message: "No authorization header provided",
			result: null,
		});
	}

	const [bearer, token] = /** @type {[string, string]} */ (auth.split(" "));
	if (!bearer) {
		return res.status(401).json({
			success: false,
			message: "Invalid bearer token",
			result: null,
		});
	}

	const decoded = User.verifyToken(token);
	if (decoded === null) {
		return res.status(403).json({
			success: false,
			message: "Malformed or expired token",
			result: null,
		});
	}

	req.auth = decoded;

	next();
};

export default auth;

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     JWT:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     Unauthorized:
 *       description: Invalid token
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: "#/components/schemas/Failure"
 *               - type: object
 *                 properties:
 *                   message: { example: Malformed or expired token }
 */
