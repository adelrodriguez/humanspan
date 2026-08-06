import type { TimeExpression } from "./types"
import { safeParse } from "./parse"
import { NUMBER_PATTERN, STRICT_UNIT_PATTERN } from "./units"

// The strict grammar: exactly what the TimeExpression type accepts. One optional sign, a number,
// at most one space, and a unit in lowercase, Capitalized, or UPPERCASE form.
const STRICT_RE = new RegExp(`^[+-]?(?:${NUMBER_PATTERN})(?: ?(?:${STRICT_UNIT_PATTERN}))?$`)

/**
 * Check whether a string is a valid single time expression in strict form, without throwing.
 *
 * Acts as a TypeScript type guard — when it returns `true`, the input is narrowed to
 * `TimeExpression`. The check matches the type exactly: it rejects compound expressions, extra
 * whitespace, and mixed casing such as `"1mS"`, even though `parse` accepts some of these
 * leniently.
 *
 * @example
 *   isTimeExpression("1h") // true
 *   isTimeExpression("500ms") // true
 *   isTimeExpression("1h 30m") // false (compound)
 *   isTimeExpression("hello") // false
 *
 *   const input: string = getUserInput()
 *   if (isTimeExpression(input)) {
 *     ms(input) // TypeScript knows `input` is TimeExpression
 *   }
 *
 * @param value - The string to validate
 *
 * @returns `true` if the string is a valid single time expression in strict form
 */
export function isTimeExpression(value: string): value is TimeExpression {
  return typeof value === "string" && STRICT_RE.test(value) && safeParse(value) !== null
}

/**
 * Check whether a string parses as a time expression (simple or compound), without throwing.
 *
 * This accepts everything `parse` accepts, including compound expressions (`"1h 30m"`) and lenient
 * forms (`"1 HOUR"`). Use `safeParse` instead when you also need the parsed value.
 *
 * @example
 *   isValidTimeExpression("1h") // true
 *   isValidTimeExpression("1h 30m") // true
 *   isValidTimeExpression("hello") // false
 *   isValidTimeExpression("") // false
 *
 * @param value - The string to validate
 *
 * @returns `true` if `parse` accepts the string
 */
export function isValidTimeExpression(value: string): boolean {
  return safeParse(value) !== null
}
