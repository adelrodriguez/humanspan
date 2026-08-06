---
"humanspan": minor
---

Redesign the parse/format API around a single grammar source, typed errors, and unit restriction.

Breaking changes:

- `parse` now throws `InvalidTimeExpressionError` for all invalid input instead of returning `NaN` or throwing `TypeError`.
- Signs on non-leading segments are now invalid. One optional leading sign applies to the whole expression (`"-1h 30m"` is `-5_400_000`; `"1h -30m"` throws). This removes the previous order-dependent sign heuristic.
- `isCompoundTimeExpression` is renamed to `isValidTimeExpression`.
- `isTimeExpression` is now strict: it matches the `TimeExpression` type exactly and rejects lenient forms such as `"1   h"` and mixed casing such as `"1mS"`, which `parse` still accepts.

New:

- `convert(value, unit)` — generic conversion primitive that accepts compound expressions (`convert("1h 30m", "minutes")`).
- `safeParse(value)` — non-throwing parse that returns `null` for invalid input.
- `InvalidTimeExpressionError` — importable typed error with the offending input on `error.value`.
- `format` accepts a `units` option to restrict output units (`format(x, { units: ["weeks", "days"] })`).
- `format` at precision 1 now carries into the next unit when rounding reaches its boundary (`format(59_999)` is `"1m"`, not `"60s"`; `format(364 * MS_PER_DAY)` is `"1y"`, not `"12mo"`).
- `UnitName` type — canonical unit names used by `convert` and the `units` option.

Fixed:

- The current Bun bundler drops named re-exports from the entry module when `package.json` declares `"sideEffects": false`, which would have shipped an empty bundle on this release. The entry now uses `export *`, which is unaffected.
- Package `exports` now includes a `default` condition.
- All unit alias types and lookup tables now derive from one `UNITS` table.
