import { constants } from "node:http2";

import * as Service from "#/services/urls.js";

/**
 * @openapi
 * tags:
 *   - name: urls
 * components:
 *   schemas:
 *     Url:
 *       type: object
 *       properties:
 *         url: { type: string, format: uri, example: "https://example.com/a/very/long/link" }
 *         encoded: { type: string, example: 8CVZNSW0V6 }
 *         createdAt: { type: string, format: date-time, example: "2026-08-19T09:30:00.000Z" }
 *         updatedAt: { type: string, format: date-time, example: "2026-08-19T09:35:12.000Z" }
 *     UrlInput:
 *       type: object
 *       required: [url]
 *       properties:
 *         url: { type: string, format: uri, example: "https://example.com/a/very/long/link" }
 *   responses:
 *     NotFound:
 *       description: Short link not found
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/Result" }
 */

/**
 * @typedef UrlBody
 * @property {string} url
 */

/**
 * @typedef UrlParams
 * @property {string} code
 */

/**
 * @typedef UrlErrors
 * @property {string} [url]
 */

/**
 * @param {string} url
 */
function validate(url) {
	/** @type {UrlErrors} */
	const errors = {};

	if (!url) {
		errors.url = "Missing url field";
	} else if (!URL.canParse(url)) {
		errors.url = "Invalid url";
	}

	return Object.keys(errors).length > 0 ? errors : null;
}

/** @type {import("express").RequestHandler<UrlParams, import("./type.js").Result<any>>} */
export const resolve = async (req, res) => {
	const record = await Service.resolve(req.params.code);

	if (!record) {
		return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
			success: false,
			message: "Short link is not found",
			result: null,
		});
	}

	return res.json({
		success: true,
		message: "Resolved",
		result: record,
	});
};

/** @type {import("express").RequestHandler<{}, import("./type.js").Result<any>>} */
export const list = async (req, res) => {
	const records = await Service.list(/** @type {RequestAuth} */ (req.auth).sub);

	return res.json({
		success: true,
		message: "Listed",
		result: records,
	});
};

/** @type {import("express").RequestHandler<{}, import("./type.js").Result<any>, UrlBody>} */
export const shorten = async (req, res) => {
	const { url } = req.body ?? {};
	const errors = validate(url);

	if (errors) {
		return res.status(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY).json({
			success: false,
			message: "Missing fields",
			result: errors,
		});
	}

	return res.status(constants.HTTP_STATUS_CREATED).json({
		success: true,
		message: "Shortened",
		result: await Service.shorten(
			url,
			/** @type {RequestAuth} */ (req.auth).sub,
		),
	});
};

/** @type {import("express").RequestHandler<UrlParams, import("./type.js").Result<any>, UrlBody>} */
export const update = async (req, res) => {
	const { url } = req.body ?? {};
	const errors = validate(url);

	if (errors) {
		return res.status(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY).json({
			success: false,
			message: "Missing fields",
			result: errors,
		});
	}

	const record = await Service.update(
		req.params.code,
		/** @type {RequestAuth} */ (req.auth).sub,
		url,
	);

	if (!record) {
		return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
			success: false,
			message: "Short link is not found",
			result: null,
		});
	}

	return res.json({
		success: true,
		message: "Updated",
		result: record,
	});
};

/** @type {import("express").RequestHandler<UrlParams, import("./type.js").Result<any>>} */
export const remove = async (req, res) => {
	const removed = await Service.remove(
		req.params.code,
		/** @type {RequestAuth} */ (req.auth).sub,
	);

	if (!removed) {
		return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
			success: false,
			message: "Short link is not found",
			result: null,
		});
	}

	return res.json({
		success: true,
		message: "Removed",
		result: null,
	});
};
