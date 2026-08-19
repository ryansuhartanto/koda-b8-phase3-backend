// oxlint-disable unicorn/require-module-specifiers
export {};

/**
 * @openapi
 * components:
 *   schemas:
 *     Result:
 *       type: object
 *       required: [success, message, result]
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         result: {}
 */

/**
 * @template [E = unknown]
 * @template [D = E]
 * @template [S = boolean]
 * @template [R = S extends true ? D : E]
 * @typedef Result
 * @property {S} success
 * @property {string} message
 * @property {R} result
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     FieldErrors:
 *       type: object
 *       properties:
 *         email: { type: string, example: Missing email field }
 *         password: { type: string, example: Missing password field }
 *         url: { type: string, example: Invalid url }
 *   responses:
 *     Invalid:
 *       description: Invalid fields
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: "#/components/schemas/Result"
 *               - type: object
 *                 properties:
 *                   result: { $ref: "#/components/schemas/FieldErrors" }
 */
