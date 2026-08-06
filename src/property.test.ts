import { describe, expect, it } from "bun:test"
import fc from "fast-check"
import { MS_PER_YEAR } from "./lib/constants"
import { format } from "./lib/format"
import { isTimeExpression, isValidTimeExpression } from "./lib/guards"
import { parse, safeParse } from "./lib/parse"
import { getUnitMs, UNITS } from "./lib/units"

const UNIT_NAMES = UNITS.map((unit) => unit.longPlural)
const ALIASES = UNITS.flatMap((unit) => unit.aliases)

function getLastUnitMs(expr: string): number {
  const token = expr.split(" ").at(-1)
  const unit = token?.match(/[a-zA-Z]+$/)?.[0]
  const unitMs = unit ? getUnitMs(unit.toLowerCase()) : undefined
  if (unitMs === undefined) throw new Error(`Cannot determine unit for expression: ${expr}`)
  return unitMs
}

const finiteMs = fc.double({
  max: 10 * MS_PER_YEAR,
  min: -10 * MS_PER_YEAR,
  noNaN: true,
})

// Integer counts keep every sum exact in float64, so equality properties hold exactly.
const segmentsArb = fc.array(
  fc.record({
    alias: fc.constantFrom(...ALIASES),
    count: fc.integer({ max: 999, min: 0 }),
  }),
  { maxLength: 5, minLength: 1 }
)

function toExpression(segments: ReadonlyArray<{ count: number; alias: string }>): string {
  return segments.map((segment) => `${segment.count}${segment.alias}`).join(" ")
}

describe("properties", () => {
  it("format output parses back within the rounding bound", () => {
    fc.assert(
      fc.property(finiteMs, fc.integer({ max: 4, min: 1 }), (value, precision) => {
        const expr = format(value, { precision })
        const parsed = parse(expr)
        const bound =
          getLastUnitMs(expr) / 2 + Math.abs(value) * Number.EPSILON * 8 + Number.EPSILON * 32

        expect(Math.abs(parsed - value)).toBeLessThanOrEqual(bound)
      })
    )
  })

  it("format output is always a valid time expression", () => {
    fc.assert(
      fc.property(
        finiteMs,
        fc.integer({ max: 4, min: 1 }),
        fc.boolean(),
        fc.subarray(UNIT_NAMES, { minLength: 1 }),
        (value, precision, long, units) => {
          expect(isValidTimeExpression(format(value, { long, precision, units }))).toBe(true)
        }
      )
    )
  })

  it("a leading sign negates the whole expression", () => {
    fc.assert(
      fc.property(segmentsArb, (segments) => {
        const expr = toExpression(segments)
        expect(parse(`-${expr}`)).toBe(-parse(expr))
        expect(parse(`+${expr}`)).toBe(parse(expr))
      })
    )
  })

  it("segment order does not change the result", () => {
    fc.assert(
      fc.property(segmentsArb, (segments) => {
        const expr = toExpression(segments)
        const reversed = toExpression(segments.toReversed())
        expect(parse(reversed)).toBe(parse(expr))
        expect(parse(`-${reversed}`)).toBe(parse(`-${expr}`))
      })
    )
  })

  it("safeParse never returns a non-finite number", () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        const parsed = safeParse(value)
        expect(parsed === null || Number.isFinite(parsed)).toBe(true)
      })
    )
  })

  it("guards agree with safeParse", () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        expect(isValidTimeExpression(value)).toBe(safeParse(value) !== null)
        if (isTimeExpression(value)) {
          expect(safeParse(value)).not.toBeNull()
        }
      })
    )
  })
})
