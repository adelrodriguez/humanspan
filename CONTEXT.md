# QTE

QTE is a zero-dependency TypeScript package that converts human-readable time expressions to numeric durations and formats numeric durations as human-readable expressions.

## Language

**Time expression**:
A string that contains one numeric value and one supported time unit, such as `"30s"` or `"1 hour"`.
_Avoid_: Duration string, time string

**Compound time expression**:
A string that contains multiple time-expression segments, such as `"1h 30m"`.
_Avoid_: Complex expression, duration string

**Segment**:
One numeric value and unit within a compound time expression.
_Avoid_: Part, token

**Unit function**:
A public conversion function named for its output unit, such as `seconds` or `days`.
_Avoid_: Parser, formatter

**Short form**:
An expression that uses an abbreviated unit, such as `"1h"`.
_Avoid_: Compact format

**Long form**:
An expression that uses a full unit name, such as `"1 hour"`.
_Avoid_: Verbose format

**Precision**:
The maximum number of segments that `format` returns.
_Avoid_: Decimal precision, accuracy

**Package consumer**:
A person or project that installs and uses QTE.
_Avoid_: User, package author
