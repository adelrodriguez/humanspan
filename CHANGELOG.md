# humanspan

## 0.2.0

### Minor Changes

- 473a7a3: Rename the package from `qte` to `humanspan`. The API does not change. Install `humanspan` and update imports from `"qte"` to `"humanspan"`.
- b96ac8c: Redesign the parse/format API around a single grammar source, typed errors, and unit restriction.

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

## 0.1.1

### Patch Changes

- a1fab60: Fix broken bundle size badge in README and move typescript to devDependencies

## 0.1.0

### Minor Changes

- de51ec7: Initial implementation of the qte library: parse human-readable time expressions into any unit, and format durations into human-readable strings. Includes `parse`, `format`, `isTimeExpression`, eight unit functions (`ms`, `seconds`, `minutes`, `hours`, `days`, `weeks`, `months`, `years`), and public conversion constants.

### Patch Changes

- de51ec7: Audit-driven cleanup:

  - Fixed compound negative round-tripping by applying leading sign semantics to compound expressions (for example, `parse("-1h 30m")` now returns `-5_400_000`).
  - Hardened `format` option validation so `precision` must be a finite positive integer; invalid values now throw `RangeError`.
  - Updated package entry metadata to point at built `dist` outputs for improved publish-time compatibility.
  - Added regression tests and README updates for the new semantics.
  - Tightened comma separator parsing to reject malformed punctuation such as leading/trailing/repeated commas.
  - Normalized precision-rounded signed-zero output to `0ms` / `0 milliseconds`.
  - Added exponent notation support in `parse` numeric tokens so very large `format()` outputs remain parseable (`parse(format(1e40))` no longer returns `NaN`).

  Behavior note: leading-sign compound parsing changed from additive-by-segment to global-sign semantics when only the first segment is signed.
