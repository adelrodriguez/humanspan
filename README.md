<div align="center">
  <h1 align="center">⏱️ <code>humanspan</code></h1>

  <p align="center">
    <strong>Type-safe time unit conversions from human-readable expressions</strong>
  </p>

  <p align="center">
    <a href="https://www.npmjs.com/package/humanspan"><img src="https://img.shields.io/npm/v/humanspan" alt="npm version"></a>
    <a href="https://pkg-size.dev/humanspan"><img src="https://pkg-size.dev/badge/install/23648640" title="Install size for humanspan"></a>
    <a href="https://github.com/adelrodriguez/humanspan/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/humanspan" alt="license"></a>
  </p>
</div>

## Features

- Convert time expressions directly into any unit — `seconds("1h")`, `days("1w")`, `ms("30s")`
- Full suite of unit functions: `ms`, `seconds`, `minutes`, `hours`, `days`, `weeks`, `months`, `years`
- Generic `convert` for compound expressions — `convert("1h 30m", "minutes")`
- TypeScript `TimeExpression` type with compile-time checking and a runtime type guard
- Parse compound expressions (`"1h 30m"`, `"1 day, 6 hours"`) into milliseconds
- Format milliseconds back to human-readable strings, with unit restriction
- Typed errors (`InvalidTimeExpressionError`) plus a non-throwing `safeParse`
- Tree-shakeable named exports, zero dependencies

## Install

```bash
npm install humanspan
# or
bun add humanspan
# or
pnpm add humanspan
```

## Quick Start

```ts
import { seconds, minutes, hours, days, ms, convert } from "humanspan"

seconds("1h") // 3600
seconds("500ms") // 0.5
minutes("2h") // 120
hours("1d") // 24
days("1w") // 7
ms("30s") // 30_000
convert("1h 30m", "minutes") // 90
```

## API

### Unit Functions

Convert a time expression to any unit. Each function accepts a `TimeExpression` string and returns the value in the named unit.

```ts
import { ms, seconds, minutes, hours, days, weeks, months, years } from "humanspan"

ms("1s") // 1000
ms("1h") // 3_600_000
seconds("1h") // 3600
seconds("500ms") // 0.5
minutes("2h") // 120
hours("1d") // 24
days("1w") // 7
weeks("1y") // 52.1775
months("1y") // 12
years("365.25d") // 1
```

A bare number (no unit) is always interpreted as **milliseconds**, in every function:

```ts
ms("100") // 100
seconds("1000") // 1 — "1000" means 1000 milliseconds
```

TypeScript validates expressions at compile time:

```ts
ms("1h") // ✅ compiles
ms("hello") // ❌ type error — "hello" is not a TimeExpression
ms("1h 30m") // ❌ type error — compound expressions go through convert or parse
```

### `convert`

The generic conversion primitive. Accepts any string — including compound expressions, which the `TimeExpression` type does not cover — and converts into the named unit.

```ts
import { convert } from "humanspan"

convert("90s", "minutes") // 1.5
convert("1h 30m", "minutes") // 90
convert("1 day, 6 hours", "hours") // 30
```

Unit names are the long plural forms: `"milliseconds"`, `"seconds"`, `"minutes"`, `"hours"`, `"days"`, `"weeks"`, `"months"`, `"years"`.

### `parse`

Parses simple or compound time expressions into milliseconds.

```ts
import { parse } from "humanspan"

parse("1h") // 3_600_000
parse("1h 30m") // 5_400_000
parse("1 day, 6 hours, 30 minutes") // 109_800_000
```

Throws `InvalidTimeExpressionError` when the input cannot be parsed. Use `safeParse` when you prefer a `null` result over an exception.

### `safeParse`

Like `parse`, but returns `null` instead of throwing.

```ts
import { safeParse } from "humanspan"

safeParse("1h 30m") // 5_400_000
safeParse("hello") // null
```

### `format`

Converts milliseconds to a human-readable time expression.

```ts
import { format } from "humanspan"

format(3_600_000) // "1h"
format(500) // "500ms"
format(-3_600_000) // "-1h"
format(3_600_000, { long: true }) // "1 hour"
format(5_432_100, { precision: 3 }) // "1h 30m 32s"
format(12_096_000_000, { units: ["days"] }) // "140d"
```

| Option      | Type         | Default   | Description                               |
| ----------- | ------------ | --------- | ----------------------------------------- |
| `long`      | `boolean`    | `false`   | Use verbose format (`"1 hour"` vs `"1h"`) |
| `precision` | `number`     | `1`       | Maximum number of unit segments to output |
| `units`     | `UnitName[]` | all units | Restrict the output to these units        |

When `precision` is `1` (the default), the value rounds to the single largest applicable unit. Rounding carries into the next unit when it reaches the boundary (`format(59_999)` is `"1m"`, not `"60s"`). Higher precision values decompose the duration into multiple segments.

The last segment absorbs the remainder and rounds it to the largest unit with a nonzero rounded value, so the round-trip error is at most half of that segment's unit. For example, `format(2 * HOUR + 500, { precision: 2 })` returns `"2h 1s"` — readable, and within 500ms of the input.

Months and years are approximations (a year is 365.25 days; a month is one twelfth of that). Use the `units` option when you need exact decomposition:

```ts
format(5 * MS_PER_WEEK, { precision: 2 }) // "1mo 1w" — approximate
format(5 * MS_PER_WEEK, { precision: 2, units: ["weeks", "days"] }) // "5w" — exact
```

The output of `format` is always a valid input for `parse`:

```ts
const expr = format(5_400_000, { precision: 2 }) // "1h 30m"
parse(expr) // 5_400_000
```

### `isTimeExpression`

Type guard that checks if a string is a valid single time expression in **strict form** — exactly what the `TimeExpression` type accepts. Never throws.

```ts
import { ms, isTimeExpression } from "humanspan"

isTimeExpression("1h") // true
isTimeExpression("500ms") // true
isTimeExpression("1h 30m") // false (compound — use isValidTimeExpression)
isTimeExpression("hello") // false

const input: string = getUserInput()
if (isTimeExpression(input)) {
  ms(input) // TypeScript knows `input` is TimeExpression
}
```

### `isValidTimeExpression`

Checks if a string parses as a time expression, simple or compound. Accepts everything `parse` accepts. Never throws.

```ts
import { isValidTimeExpression } from "humanspan"

isValidTimeExpression("1h") // true
isValidTimeExpression("1h 30m") // true
isValidTimeExpression("hello") // false
```

### Constants

Millisecond-based conversion factors for custom arithmetic (e.g. computing a cache TTL or rate limit window):

```ts
import {
  MS_PER_SECOND, // 1_000
  MS_PER_MINUTE, // 60_000
  MS_PER_HOUR, // 3_600_000
  MS_PER_DAY, // 86_400_000
  MS_PER_WEEK, // 604_800_000
  MS_PER_MONTH, // 2_629_800_000
  MS_PER_YEAR, // 31_557_600_000
} from "humanspan"
```

## Compound Expressions

The parser supports multi-part expressions. Segments are summed together, so duplicate units are additive and segment order never changes the result.

```ts
// Space-separated
parse("1h 30m") // 5_400_000

// Comma-separated (single commas only)
parse("1h, 30m") // 5_400_000

// Concatenated (no separator)
parse("1h30m") // 5_400_000

// Long form
parse("1 hour 30 minutes") // 5_400_000
parse("1 year 2 weeks 5 days") // 33_199_200_000

// Duplicate units are additive
parse("1h 2h") // 10_800_000

// Order doesn't matter
parse("30m 1h") // 5_400_000
```

Malformed delimiter punctuation is rejected (`",1h"`, `"1h,"`, `"1h,,30m"`, and `"1h, ,30m"` are invalid). Bare numbers are only valid on their own — every segment in a compound expression must have a unit.

### Signs

One optional sign (`-` or `+`) can prefix the expression. It applies to the whole value. Signs on later segments are invalid.

```ts
parse("-1h 30m") // -5_400_000
parse("+1h 30m") // 5_400_000
parse("-1h30m") // -5_400_000

parse("1h -30m") // ❌ throws — signs are not allowed on later segments
parse("- 1h") // ❌ throws — the sign must be attached to the number
```

### Strict and lenient grammar

`parse` is deliberately lenient: it is case-insensitive and allows flexible whitespace (`"1   HOUR"` parses fine). The `TimeExpression` type and the `isTimeExpression` guard use the strict form: at most one space, and units in lowercase (`"1h"`), Capitalized (`"1 Hour"`), or UPPERCASE (`"1 HOUR"`) casing. Everything the strict form accepts, `parse` accepts too.

### Supported Units

Spaces between number and unit are optional. Numeric tokens support decimals and exponent notation (`"1e3ms"`).

| Unit         | Short | Aliases                                        |
| ------------ | ----- | ---------------------------------------------- |
| Milliseconds | `ms`  | `milliseconds`, `millisecond`, `msecs`, `msec` |
| Seconds      | `s`   | `seconds`, `second`, `secs`, `sec`             |
| Minutes      | `m`   | `minutes`, `minute`, `mins`, `min`             |
| Hours        | `h`   | `hours`, `hour`, `hrs`, `hr`                   |
| Days         | `d`   | `days`, `day`                                  |
| Weeks        | `w`   | `weeks`, `week`                                |
| Months       | `mo`  | `months`, `month`                              |
| Years        | `y`   | `years`, `year`, `yrs`, `yr`                   |

## Types

```ts
import type { TimeExpression, FormatOptions, Unit, UnitName } from "humanspan"
```

- **`TimeExpression`** — A template literal type for single time expressions (`"1h"`, `"30s"`, `"500ms"`). Rejects invalid string literals at compile time. Used by unit functions (`ms`, `seconds`, etc.).
- **`FormatOptions`** — Options for `format()` (`long`, `precision`, `units`).
- **`Unit`** — Union of all recognized unit alias strings (e.g. `"hours"`, `"h"`, `"hr"`).
- **`UnitName`** — Canonical unit names (`"seconds"`, `"minutes"`, ...) used by `convert` and the `units` format option.

## Error Handling

**`parse`, `convert`, and unit functions:**

- Throw an `InvalidTimeExpressionError` if the input is not a string, is empty, exceeds 200 characters, or cannot be parsed. The error exposes the offending input on its `value` property.
- `convert` also throws a `RangeError` for unknown unit names.

```ts
import { parse, InvalidTimeExpressionError } from "humanspan"

try {
  parse(userInput)
} catch (error) {
  if (error instanceof InvalidTimeExpressionError) {
    console.error(error.message) // Invalid time expression: ... Received: "..."
  }
}
```

**`safeParse`, `isTimeExpression`, and `isValidTimeExpression`:**

- Never throw. `safeParse` returns `null` for invalid input; the guards return `false`.

**`format`:**

- Throws a `TypeError` if the input is not a finite number (`Infinity`, `-Infinity`, `NaN`).
- Throws a `RangeError` if `precision` is not a finite positive integer, or if `units` is empty or contains an unknown unit name.

## License

MIT
