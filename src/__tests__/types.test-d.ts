// Compile-time checks only: `pnpm run check` enforces this file, and Vitest never runs it.
import {
  convert,
  days,
  type Days,
  format,
  type FormatOptions,
  hours,
  type Hours,
  InvalidTimeExpressionError,
  isTimeExpression,
  isValidTimeExpression,
  type Milliseconds,
  minutes,
  type Minutes,
  months,
  type Months,
  ms,
  MS_PER_DAY,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  MS_PER_MONTH,
  MS_PER_SECOND,
  MS_PER_WEEK,
  MS_PER_YEAR,
  parse,
  safeParse,
  type Seconds,
  seconds,
  type TimeExpression,
  type Unit,
  type UnitAnyCase,
  type UnitName,
  weeks,
  type Weeks,
  years,
  type Years,
} from "../index"

// ── Helpers ──────────────────────────────────────────────────────────────────
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

type Expect<T extends true> = T

// ── Test fixtures ────────────────────────────────────────────────────────────
declare const userInput: string

// ── Positive type-level tests ────────────────────────────────────────────────
// Derives each unit alias type from the UNITS table.
{
  type _Years = Expect<Equal<Years, "years" | "year" | "yrs" | "yr" | "y">>
  type _Months = Expect<Equal<Months, "months" | "month" | "mo">>
  type _Weeks = Expect<Equal<Weeks, "weeks" | "week" | "w">>
  type _Days = Expect<Equal<Days, "days" | "day" | "d">>
  type _Hours = Expect<Equal<Hours, "hours" | "hour" | "hrs" | "hr" | "h">>
  type _Minutes = Expect<Equal<Minutes, "minutes" | "minute" | "mins" | "min" | "m">>
  type _Seconds = Expect<Equal<Seconds, "seconds" | "second" | "secs" | "sec" | "s">>
  type _Milliseconds = Expect<
    Equal<Milliseconds, "milliseconds" | "millisecond" | "msecs" | "msec" | "ms">
  >
}

// Makes Unit the union of every unit alias type.
{
  type _Unit = Expect<
    Equal<Unit, Years | Months | Weeks | Days | Hours | Minutes | Seconds | Milliseconds>
  >
}

// Makes UnitName the union of the long plural unit names.
{
  type _UnitName = Expect<
    Equal<
      UnitName,
      "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds" | "milliseconds"
    >
  >
  type _UnitNameIsUnit = Expect<UnitName extends Unit ? true : false>
}

// Makes UnitAnyCase cover lowercase, Capitalized, and UPPERCASE units.
{
  type _UnitAnyCase = Expect<Equal<UnitAnyCase, Unit | Capitalize<Unit> | Uppercase<Unit>>>
  type _Lowercase = Expect<"ms" extends UnitAnyCase ? true : false>
  type _Capitalized = Expect<"Hour" extends UnitAnyCase ? true : false>
  type _Uppercase = Expect<"HOURS" extends UnitAnyCase ? true : false>
}

// Accepts bare numbers and units with zero or one space in TimeExpression.
{
  const bare: TimeExpression = "500"
  const compact: TimeExpression = "1h"
  const spaced: TimeExpression = "1 h"
  const long: TimeExpression = "2 hours"
  const signed: TimeExpression = "-1.5d"
  const positive: TimeExpression = "+1h"
  const fractional: TimeExpression = ".5h"
  const exponent: TimeExpression = "1e3ms"
  const capitalized: TimeExpression = "1 Hour"
  const uppercase: TimeExpression = "1HOUR"

  void [bare, compact, spaced, long, signed, positive, fractional, exponent, capitalized, uppercase]
}

// Returns number from parse and number | null from safeParse.
{
  const parsed = parse(userInput)
  const safeParsed = safeParse(userInput)

  type _Parse = Expect<Equal<typeof parsed, number>>
  type _SafeParse = Expect<Equal<typeof safeParsed, number | null>>
  type _ParseParams = Expect<Equal<Parameters<typeof parse>, [value: string]>>
  type _SafeParseParams = Expect<Equal<Parameters<typeof safeParse>, [value: string]>>
}

// Narrows a string to TimeExpression with isTimeExpression.
{
  if (isTimeExpression(userInput)) {
    type _Narrowed = Expect<Equal<typeof userInput, TimeExpression>>

    ms(userInput)
  } else {
    type _NotNarrowed = Expect<Equal<typeof userInput, string>>
  }
}

// Returns a plain boolean from isValidTimeExpression, without narrowing.
{
  type _Return = Expect<Equal<ReturnType<typeof isValidTimeExpression>, boolean>>

  if (isValidTimeExpression(userInput)) {
    type _NotNarrowed = Expect<Equal<typeof userInput, string>>
  }
}

// Accepts any string and a UnitName in convert, and returns number.
{
  const result = convert(userInput, "minutes")

  type _Result = Expect<Equal<typeof result, number>>
  type _Params = Expect<Equal<Parameters<typeof convert>, [value: string, unit: UnitName]>>
}

// Types each unit helper as (value: TimeExpression) => number.
{
  type UnitHelper = (value: TimeExpression) => number

  type _Ms = Expect<Equal<typeof ms, UnitHelper>>
  type _Seconds = Expect<Equal<typeof seconds, UnitHelper>>
  type _Minutes = Expect<Equal<typeof minutes, UnitHelper>>
  type _Hours = Expect<Equal<typeof hours, UnitHelper>>
  type _Days = Expect<Equal<typeof days, UnitHelper>>
  type _Weeks = Expect<Equal<typeof weeks, UnitHelper>>
  type _Months = Expect<Equal<typeof months, UnitHelper>>
  type _Years = Expect<Equal<typeof years, UnitHelper>>
}

// Types format options and returns string from format.
{
  const units: readonly UnitName[] = ["hours", "minutes"]
  const result = format(5_400_000, { long: true, precision: 2, units })

  type _Result = Expect<Equal<typeof result, string>>
  type _Params = Expect<
    Equal<Parameters<typeof format>, [milliseconds: number, options?: FormatOptions]>
  >
  type _Long = Expect<Equal<FormatOptions["long"], boolean | undefined>>
  type _Precision = Expect<Equal<FormatOptions["precision"], number | undefined>>
  type _Units = Expect<Equal<FormatOptions["units"], readonly UnitName[] | undefined>>
}

// Exposes the invalid input on InvalidTimeExpressionError as readonly unknown.
{
  const error = new InvalidTimeExpressionError("1 parsec", "value is not a valid time expression")

  type _ExtendsError = Expect<typeof error extends Error ? true : false>
  type _Value = Expect<Equal<typeof error.value, unknown>>
  type _CtorParams = Expect<
    Equal<
      ConstructorParameters<typeof InvalidTimeExpressionError>,
      [value: unknown, reason: string]
    >
  >
}

// Types the millisecond constants as numbers.
{
  const constants: readonly number[] = [
    MS_PER_SECOND,
    MS_PER_MINUTE,
    MS_PER_HOUR,
    MS_PER_DAY,
    MS_PER_WEEK,
    MS_PER_MONTH,
    MS_PER_YEAR,
  ]

  void constants
}

// ── Negative type tests ──────────────────────────────────────────────────────
// These verify that invalid usage produces compile-time errors.
// The function bodies never execute — only the type checker matters.

function _negativeTypeTests() {
  // @ts-expect-error -- "parsec" is not a unit
  ms("1 parsec")

  // @ts-expect-error -- a plain string must be narrowed with isTimeExpression first
  ms(userInput)

  // @ts-expect-error -- compound expressions are not a TimeExpression; use convert instead
  seconds("1h 30m")

  // @ts-expect-error -- an empty string is not a TimeExpression
  minutes("")

  // @ts-expect-error -- a unit with no number is not a TimeExpression
  hours("h")

  // @ts-expect-error -- mixed casing is not a TimeExpression
  days("1mS")

  // @ts-expect-error -- trailing whitespace is not a TimeExpression
  weeks("1w ")

  // @ts-expect-error -- a sign must be attached to the number
  months("- 1mo")

  // @ts-expect-error -- Infinity is not a finite number
  years("Infinityy")

  // @ts-expect-error -- unit helpers take a string, not a number
  ms(1000)

  // @ts-expect-error -- convert takes a UnitName, not a unit alias
  convert("1h", "h")

  // @ts-expect-error -- convert takes a UnitName, not a singular unit
  convert("1h", "minute")

  // @ts-expect-error -- "fortnights" is not a UnitName
  convert("1h", "fortnights")

  // @ts-expect-error -- convert takes a UnitName, not any string
  convert("1h", userInput)

  // @ts-expect-error -- format units must be UnitName values
  format(1000, { units: ["h"] })

  // @ts-expect-error -- format takes a number, not a time expression
  format("1h")

  // @ts-expect-error -- precision is a number
  format(1000, { precision: "2" })

  // @ts-expect-error -- isTimeExpression takes a string
  isTimeExpression(1000)

  // @ts-expect-error -- parse takes a string
  parse(1000)

  // @ts-expect-error -- "1 parsec" is not a TimeExpression
  const invalid: TimeExpression = "1 parsec"
  void invalid

  // @ts-expect-error -- "parsec" is not a Unit
  const unit: Unit = "parsec"
  void unit

  const error = new InvalidTimeExpressionError("1 parsec", "value is not a valid time expression")

  // @ts-expect-error -- value is readonly
  error.value = "1h"
}

// Suppress unused function warning — this exists only for type checking
void _negativeTypeTests
