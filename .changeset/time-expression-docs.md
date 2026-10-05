---
"humanspan": patch
---

Clarify in the docs that `isTimeExpression` accepts a strict subset of the `TimeExpression` type. Some strings, such as `"0x10h"` or `" 1h"`, satisfy the type but the guard rejects them.
