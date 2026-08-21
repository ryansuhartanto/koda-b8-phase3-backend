// oxlint-disable unicorn/require-module-specifiers
export {};

/**
 * @openapi
 * components:
 *   schemas:
 *     Result:
 *       type: object
 *       required: [success, message, results]
 *       properties:
 *         success: { type: boolean, const: true }
 *         message: { type: string }
 *         results: {}
 *     Failure:
 *       allOf:
 *         - $ref: "#/components/schemas/Result"
 *         - properties:
 *             success: { const: false }
 */

/**
 * @template [E = unknown]
 * @template [D = E]
 * @template [S = boolean]
 * @template [R = S extends true ? D : E]
 * @typedef Result
 * @property {S} success
 * @property {string} message
 * @property {R} results
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
 *         custom: { type: string, example: This custom path is reserved for our service }
 *   responses:
 *     Invalid:
 *       description: Invalid fields
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: "#/components/schemas/Failure"
 *               - type: object
 *                 properties:
 *                   message: { example: Missing fields }
 *                   results: { $ref: "#/components/schemas/FieldErrors" }
 */
