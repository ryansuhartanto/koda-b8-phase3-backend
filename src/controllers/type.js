// oxlint-disable unicorn/require-module-specifiers
export {};

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
