---
"humanspan": minor
---

`parse` now rejects a segment that starts with a dot when no separator comes before it. Before, `"1h.5m"` was read as `"1h 0.5m"`. Write `"1h .5m"` or `"1h0.5m"` instead.
