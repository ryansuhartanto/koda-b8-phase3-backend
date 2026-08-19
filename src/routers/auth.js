import { Router } from "express";

import * as Controller from "#/controllers/auth.js";

/** @type {Router} */
const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [auth]
 *     summary: Authenticate and receive a JWT
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
 *                     result: { $ref: "#/components/schemas/Auth" }
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
 *     summary: Register an account and receive a JWT
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
 *                     result: { $ref: "#/components/schemas/Auth" }
 *       401:
 *         $ref: "#/components/responses/Invalid"
 *       422:
 *         $ref: "#/components/responses/Invalid"
 */
router.post("/register", Controller.register);

export default router;
