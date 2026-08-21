import { Router } from "express";

import * as Controller from "#/controllers/auth.js";

/** @type {Router} */
const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [auth]
 *     summary: Authenticate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/Credentials" }
 *         application/x-www-form-urlencoded:
 *           schema: { $ref: "#/components/schemas/Credentials" }
 *     responses:
 *       200:
 *         description: Authenticated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Result"
 *                 - type: object
 *                   properties:
 *                     results: { $ref: "#/components/schemas/Auth" }
 *       401:
 *         $ref: "#/components/responses/Invalid"
 *       422:
 *         $ref: "#/components/responses/Invalid"
 */
router.post("/login", Controller.login);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [auth]
 *     summary: Register
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/Credentials" }
 *         application/x-www-form-urlencoded:
 *           schema: { $ref: "#/components/schemas/Credentials" }
 *     responses:
 *       200:
 *         description: Registered
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Result"
 *                 - type: object
 *                   properties:
 *                     results: { $ref: "#/components/schemas/Auth" }
 *       409:
 *         description: Email is already registered
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Failure"
 *                 - type: object
 *                   properties:
 *                     message: { example: Email is already registered }
 *                     results: { $ref: "#/components/schemas/FieldErrors" }
 *       422:
 *         $ref: "#/components/responses/Invalid"
 */
router.post("/register", Controller.register);

export default router;
