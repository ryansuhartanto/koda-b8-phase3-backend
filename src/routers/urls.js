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
 *     security: []
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
router.get("/:code", Controller.resolve);

router.use(auth);

/**
 * @openapi
 * /urls:
 *   get:
 *     tags: [urls]
 *     summary: List owned short links
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
 *                     result:
 *                       type: array
 *                       items: { $ref: "#/components/schemas/Url" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *   post:
 *     tags: [urls]
 *     summary: Shorten a url
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
 *       422:
 *         $ref: "#/components/responses/Invalid"
 */
router.get("/", Controller.list);
router.post("/", Controller.shorten);

/**
 * @openapi
 * /urls/{code}:
 *   patch:
 *     tags: [urls]
 *     summary: Repoint a short link
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
 *       422:
 *         $ref: "#/components/responses/Invalid"
 *   delete:
 *     tags: [urls]
 *     summary: Delete a short link
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
router.patch("/:code", Controller.update);
router.delete("/:code", Controller.remove);

export default router;
