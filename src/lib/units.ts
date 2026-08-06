import {
  MS_PER_DAY,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  MS_PER_MONTH,
  MS_PER_SECOND,
  MS_PER_WEEK,
  MS_PER_YEAR,
} from "./constants"

/**
 * Canonical runtime definition for a unit and its aliases.
 */
export interface UnitDefinition {
  readonly aliases: readonly string[]
  readonly long: string
  readonly longPlural: string
  readonly ms: number
  readonly short: string
}

/**
 * The single source of truth for all supported units, ordered from largest to smallest. The alias
 * unions in `types.ts`, the parse grammar, and the format output all derive from this table.
 */
export const UNITS = [
  {
    aliases: ["years", "year", "yrs", "yr", "y"],
    long: "year",
    longPlural: "years",
    ms: MS_PER_YEAR,
    short: "y",
  },
  {
    aliases: ["months", "month", "mo"],
    long: "month",
    longPlural: "months",
    ms: MS_PER_MONTH,
    short: "mo",
  },
  {
    aliases: ["weeks", "week", "w"],
    long: "week",
    longPlural: "weeks",
    ms: MS_PER_WEEK,
    short: "w",
  },
  {
    aliases: ["days", "day", "d"],
    long: "day",
    longPlural: "days",
    ms: MS_PER_DAY,
    short: "d",
  },
  {
    aliases: ["hours", "hour", "hrs", "hr", "h"],
    long: "hour",
    longPlural: "hours",
    ms: MS_PER_HOUR,
    short: "h",
  },
  {
    aliases: ["minutes", "minute", "mins", "min", "m"],
    long: "minute",
    longPlural: "minutes",
    ms: MS_PER_MINUTE,
    short: "m",
  },
  {
    aliases: ["seconds", "second", "secs", "sec", "s"],
    long: "second",
    longPlural: "seconds",
    ms: MS_PER_SECOND,
    short: "s",
  },
  {
    aliases: ["milliseconds", "millisecond", "msecs", "msec", "ms"],
    long: "millisecond",
    longPlural: "milliseconds",
    ms: 1,
    short: "ms",
  },
] as const satisfies readonly UnitDefinition[]

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

// Longer alternatives must come before shorter ones to prevent partial matches
// (e.g. "months" before "mo", "minutes" before "m").
function toAlternation(aliases: readonly string[]): string {
  return aliases
    .toSorted((a, b) => b.length - a.length)
    .map((alias) => escapeRegExp(alias))
    .join("|")
}

const UNIT_ALIASES = [...new Set(UNITS.flatMap((unit) => unit.aliases))]

/**
 * Unsigned numeric token shared by the strict and lenient grammars.
 */
export const NUMBER_PATTERN = "\\d*\\.?\\d+(?:[eE][+-]?\\d+)?"

/**
 * Case-insensitive alias alternation for the lenient parse grammar. Combine with the `i` flag.
 */
export const LENIENT_UNIT_PATTERN = toAlternation(UNIT_ALIASES)

/**
 * Exact-casing alias alternation for the strict grammar. Accepts only the casings that the
 * `TimeExpression` type accepts: lowercase, Capitalized, and UPPERCASE.
 */
export const STRICT_UNIT_PATTERN = toAlternation([
  ...new Set(UNIT_ALIASES.flatMap((alias) => [alias, alias.toUpperCase(), capitalize(alias)])),
])

const UNIT_MS_BY_ALIAS: ReadonlyMap<string, number> = new Map(
  UNITS.flatMap((unit) => unit.aliases.map((alias) => [alias, unit.ms] as const))
)

const UNIT_BY_NAME: ReadonlyMap<string, UnitDefinition> = new Map(
  UNITS.map((unit) => [unit.longPlural, unit])
)

/**
 * Look up the millisecond multiplier for a lowercase unit alias.
 */
export function getUnitMs(alias: string): number | undefined {
  return UNIT_MS_BY_ALIAS.get(alias)
}

/**
 * Look up a unit definition by its long plural name (e.g. `"seconds"`).
 */
export function getUnitByName(name: string): UnitDefinition | undefined {
  return UNIT_BY_NAME.get(name)
}
