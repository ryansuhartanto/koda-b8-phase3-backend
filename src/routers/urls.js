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
 *     summary: Resolve a short code to its target url
 *     security: []
 *     parameters:
 *       - name: code
 *         in: path
 *         required: true
 *         schema: { type: string }
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
 *     summary: List the short links owned by the caller
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
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url: { type: string, format: uri }
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
 *     summary: Repoint an owned short link
 *     parameters:
 *       - name: code
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url: { type: string, format: uri }
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
 *     summary: Delete an owned short link
 *     parameters:
 *       - name: code
 *         in: path
 *         required: true
 *         schema: { type: string }
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
