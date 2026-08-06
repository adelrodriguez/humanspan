import type { UNITS } from "./units"

type UnitRow = (typeof UNITS)[number]

type AliasesOf<Long extends UnitRow["long"]> = Extract<UnitRow, { long: Long }>["aliases"][number]

/**
 * Year unit aliases.
 */
export type Years = AliasesOf<"year">

/**
 * Month unit aliases.
 */
export type Months = AliasesOf<"month">

/**
 * Week unit aliases.
 */
export type Weeks = AliasesOf<"week">

/**
 * Day unit aliases.
 */
export type Days = AliasesOf<"day">

/**
 * Hour unit aliases.
 */
export type Hours = AliasesOf<"hour">

/**
 * Minute unit aliases.
 */
export type Minutes = AliasesOf<"minute">

/**
 * Second unit aliases.
 */
export type Seconds = AliasesOf<"second">

/**
 * Millisecond unit aliases.
 */
export type Milliseconds = AliasesOf<"millisecond">

/**
 * Union of all recognized time unit strings, derived from the `UNITS` table.
 */
export type Unit = UnitRow["aliases"][number]

/**
 * Canonical unit name (long plural), used by `convert` and the `units` format option.
 */
export type UnitName = UnitRow["longPlural"]

/**
 * Any casing variant of a time unit (lowercase, Capitalized, UPPERCASE).
 */
export type UnitAnyCase = Unit | Capitalize<Unit> | Uppercase<Unit>

/**
 * A single time expression in strict form: a bare number (interpreted as milliseconds), or a number
 * followed by a unit (with or without one space).
 *
 * This type is the strict grammar. `isTimeExpression` matches it exactly, and `parse` accepts a
 * lenient superset of it (flexible whitespace and any unit casing).
 */
export type TimeExpression = `${number}` | `${number}${UnitAnyCase}` | `${number} ${UnitAnyCase}`

/**
 * Options for `format`.
 */
export interface FormatOptions {
  /**
   * Use verbose formatting (`"1 hour"` instead of `"1h"`). Defaults to `false`.
   */
  long?: boolean
  /**
   * Maximum number of unit segments to include. Defaults to `1`.
   */
  precision?: number
  /**
   * Restrict the output to these units. Defaults to all units. The order of the array does not
   * matter; output segments always run from the largest unit to the smallest.
   */
  units?: readonly UnitName[]
}
