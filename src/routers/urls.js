import { Router } from "express";

import * as Controller from "#/controllers/urls.js";
import auth from "#/middleware/auth.js";

/** @type {Router} */
const router = Router();

/**
 * @openapi
 * /urls/{code}:
 *   get:
 *     tags: [urls]
 *     summary: Resolve a short code
 *     parameters:
 *       - name: code
 *         in: path
 *         required: true
 *         schema: { type: string, example: 8CVZNSW0V6 }
 *     responses:
 *       200:
 *         description: Resolved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Result"
 *                 - type: object
 *                   properties:
 *                     result: { $ref: "#/components/schemas/Url" }
 *       404:
 *         $ref: "#/components/responses/NotFound"
 */
router.get("/*code", Controller.resolve);

/** @type {import("express").RequestHandler<{}, import("#/controllers/type.js").Result<import("#/middleware/auth.js").AuthMiddlewareResult>>} */
const optional = (req, res, next) =>
	req.headers.authorization
		? auth(
				// auth types its request as AuthMiddlewareBody, no route carries it
				/** @type {Parameters<typeof auth>[0]} */ (
					/** @type {unknown} */ (req)
				),
				res,
				next,
			)
		: next();

/**
 * @openapi
 * /urls:
 *   post:
 *     tags: [urls]
 *     summary: Shorten a url
 *     description: Anonymous unless a custom path is given, which requires a token.
 *     security: [{}, { JWT: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/UrlInput" }
 *         application/x-www-form-urlencoded:
 *           schema: { $ref: "#/components/schemas/UrlInput" }
 *     responses:
 *       201:
 *         description: Shortened
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Result"
 *                 - type: object
 *                   properties:
 *                     result: { $ref: "#/components/schemas/Url" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       409:
 *         $ref: "#/components/responses/Taken"
 *       422:
 *         $ref: "#/components/responses/Invalid"
 */
router.post("/", optional, Controller.shorten);

router.use(auth);

/**
 * @openapi
 * /urls:
 *   get:
 *     tags: [urls]
 *     summary: List owned short links
 *     security: [{ JWT: [] }]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, minimum: 1, default: 20 }
 *       - name: q
 *         in: query
 *         description: Substring of the url or custom path, or a whole code
 *         schema: { type: string }
 *         example: example.com
 *     responses:
 *       200:
 *         description: Listed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Result"
 *                 - type: object
 *                   properties:
 *                     total: { type: integer, example: 42 }
 *                     result:
 *                       type: array
 *                       items: { $ref: "#/components/schemas/Url" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 */
router.get("/", Controller.list);

/**
 * @openapi
 * /urls/{code}:
 *   patch:
 *     tags: [urls]
 *     summary: Repoint a short link
 *     security: [{ JWT: [] }]
 *     parameters:
 *       - name: code
 *         in: path
 *         required: true
 *         schema: { type: string, example: 8CVZNSW0V6 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/UrlInput" }
 *         application/x-www-form-urlencoded:
 *           schema: { $ref: "#/components/schemas/UrlInput" }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Result"
 *                 - type: object
 *                   properties:
 *                     result: { $ref: "#/components/schemas/Url" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       409:
 *         $ref: "#/components/responses/Taken"
 *       422:
 *         $ref: "#/components/responses/Invalid"
 *   delete:
 *     tags: [urls]
 *     summary: Delete a short link
 *     security: [{ JWT: [] }]
 *     parameters:
 *       - name: code
 *         in: path
 *         required: true
 *         schema: { type: string, example: 8CVZNSW0V6 }
 *     responses:
 *       200:
 *         description: Removed
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/Result" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 */
router.patch("/*code", Controller.update);
router.delete("/*code", Controller.remove);

export default router;
