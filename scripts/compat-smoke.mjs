// Checks that the built bundle runs on the minimum supported runtime.
//
// The floor is the `engines.node` version in package.json. The bundle must not import Node.js
// modules. This script also removes globals that are newer than the floor, so a run on a newer
// runtime fails in the same way as a run on the floor.
//
// Usage: node scripts/compat-smoke.mjs [dist directory]

import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

const distDir = resolve(process.argv[2] ?? "dist")
const entry = resolve(distDir, "index.js")

function check(condition, message) {
  if (!condition) {
    throw new Error(`Compatibility smoke test failed: ${message}`)
  }
}

const content = await readFile(entry, "utf8")
check(
  !/(?:from|import|require)\s*\(?\s*["']node:/.test(content),
  "the bundle imports no Node.js module"
)

if (typeof Array.prototype.toSorted !== "function") {
  throw new Error("This runtime is below the supported floor")
}

// Globals that Node.js added after 20.0.0.
delete RegExp.escape
delete Object.groupBy
delete Map.groupBy
delete Promise.withResolvers
delete Array.fromAsync
delete Error.isError
delete Math.sumPrecise
delete Set.prototype.difference
delete Set.prototype.intersection
delete Set.prototype.isDisjointFrom
delete Set.prototype.isSubsetOf
delete Set.prototype.isSupersetOf
delete Set.prototype.symmetricDifference
delete Set.prototype.union

/**
 * @type {typeof import("../src/index")}
 */
const humanspan = await import(pathToFileURL(entry).href)

check(humanspan.MS_PER_DAY === 86_400_000, "MS_PER_DAY is one day")
check(humanspan.parse("1h 30m") === 5_400_000, "parse() reads a compound time expression")
check(humanspan.parse("-1 HOUR") === -3_600_000, "parse() reads the lenient form")
check(humanspan.safeParse("hello") === null, "safeParse() returns null for invalid input")
check(humanspan.ms("1s") === 1000, "ms() converts to milliseconds")
check(humanspan.seconds("1h") === 3600, "seconds() converts to seconds")
check(humanspan.years("365.25d") === 1, "years() converts to years")
check(humanspan.convert("1 day, 6 hours", "hours") === 30, "convert() converts to a unit name")
check(humanspan.format(5_432_100, { precision: 3 }) === "1h 30m 32s", "format() splits segments")
check(humanspan.format(3_600_000, { long: true }) === "1 hour", "format() writes the long form")
check(humanspan.format(12_096_000_000, { units: ["days"] }) === "140d", "format() limits units")
check(humanspan.isTimeExpression("500ms"), "isTimeExpression() accepts the strict form")
check(!humanspan.isTimeExpression("1h 30m"), "isTimeExpression() rejects a compound expression")
check(humanspan.isValidTimeExpression("1h 30m"), "isValidTimeExpression() accepts a compound one")

let parseError
try {
  humanspan.parse("hello")
} catch (error) {
  parseError = error
}
check(
  parseError instanceof humanspan.InvalidTimeExpressionError && parseError.value === "hello",
  "parse() throws InvalidTimeExpressionError"
)
