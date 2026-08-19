import { constants } from "node:http2";

import { reject } from "#/lib/custom.js";
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
 *         custom: { type: string, example: my/custom/link }
 *   responses:
 *     Taken:
 *       description: Custom path is already taken
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: "#/components/schemas/Failure"
 *               - type: object
 *                 properties:
 *                   message: { example: This custom path is already taken }
 *                   result: { $ref: "#/components/schemas/FieldErrors" }
 *     NotFound:
 *       description: Short link not found
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: "#/components/schemas/Failure"
 *               - type: object
 *                 properties:
 *                   message: { example: Short link is not found }
 */

/**
 * @typedef UrlBody
 * @property {string} url
 * @property {string} [custom]
 */

/**
 * @typedef UrlParams
 * @property {string[]} code
 */

const PAGE_SIZE = 20;

/**
 * @typedef UrlErrors
 * @property {string} [url]
 * @property {string} [custom]
 */

/**
 * @param {unknown} value
 * @param {number} fallback
 */
function counted(value, fallback) {
	const parsed = Number(value);

	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * @param {string} url
 * @param {string} [custom]
 */
function validate(url, custom) {
	/** @type {UrlErrors} */
	const errors = {};

	if (!url) {
		errors.url = "Missing url field";
	} else if (!URL.canParse(url)) {
		errors.url = "Invalid url";
	}

	if (custom) {
		const rejected = reject(custom);

		if (rejected) {
			errors.custom = rejected;
		}
	}

	return Object.keys(errors).length > 0 ? errors : null;
}

/** @type {import("express").RequestHandler<UrlParams, import("./type.js").Result<any>>} */
export const resolve = async (req, res) => {
	const record = await Service.resolve(req.params.code.join("/"));

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

/** @type {import("express").RequestHandler<{}, import("./type.js").Result<any> & { total: number }>} */
export const list = async (req, res) => {
	const limit = counted(req.query["limit"], PAGE_SIZE);
	const page = counted(req.query["page"], 1);
	const { rows, count } = await Service.list(
		/** @type {RequestAuth} */ (req.auth).sub,
		limit,
		(page - 1) * limit,
	);

	return res.json({
		success: true,
		message: "Listed",
		total: count,
		result: rows,
	});
};

/** @type {import("express").RequestHandler<{}, import("./type.js").Result<any>, UrlBody>} */
export const shorten = async (req, res) => {
	const { url, custom } = req.body ?? {};
	const alias = custom === "" ? undefined : custom;
	const errors = validate(url, alias);

	if (errors) {
		return res.status(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY).json({
			success: false,
			message: "Missing fields",
			result: errors,
		});
	}

	const record = await Service.shorten(
		url,
		/** @type {RequestAuth} */ (req.auth).sub,
		alias,
	);

	if (record === false) {
		return res.status(constants.HTTP_STATUS_CONFLICT).json({
			success: false,
			message: "This custom path is already taken",
			result: { custom: "This custom path is already taken" },
		});
	}

	return res.status(constants.HTTP_STATUS_CREATED).json({
		success: true,
		message: "Shortened",
		result: record,
	});
};

/** @type {import("express").RequestHandler<UrlParams, import("./type.js").Result<any>, UrlBody>} */
export const update = async (req, res) => {
	const { url, custom } = req.body ?? {};
	const alias = custom === "" ? undefined : custom;
	const errors = validate(url, alias);

	if (errors) {
		return res.status(constants.HTTP_STATUS_UNPROCESSABLE_ENTITY).json({
			success: false,
			message: "Missing fields",
			result: errors,
		});
	}

	const record = await Service.update(
		req.params.code.join("/"),
		/** @type {RequestAuth} */ (req.auth).sub,
		url,
		alias,
	);

	if (record === false) {
		return res.status(constants.HTTP_STATUS_CONFLICT).json({
			success: false,
			message: "This custom path is already taken",
			result: { custom: "This custom path is already taken" },
		});
	}

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
		req.params.code.join("/"),
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
