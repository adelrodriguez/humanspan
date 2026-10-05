import type { UnitAnyCase } from "../units/types"

/**
 * A single time expression in strict form: a bare number (interpreted as milliseconds), or a number
 * followed by a unit (with or without one space).
 *
 * This type is the strict grammar. `isTimeExpression` matches it exactly, and `parse` accepts a
 * lenient superset of it (flexible whitespace and any unit casing).
 */
export type TimeExpression = `${number}` | `${number}${UnitAnyCase}` | `${number} ${UnitAnyCase}`
