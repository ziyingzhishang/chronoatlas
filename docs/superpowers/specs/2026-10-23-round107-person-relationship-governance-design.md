# Round 107 Person Governance Relationship Design

## Goal

Close at most three current required governance gaps using only direct evidence already present in person details: an explicit ruler/king office, a valid polity endpoint, a valid date range, and resolvable source IDs.

## Decision

Add exactly three `ruled` person-to-polity claims for the existing Nanzhao ruler records:

| Person | Polity | Valid range | Direct office evidence |
| --- | --- | --- | --- |
| 阁罗凤 `geluofeng` | 南诏 `nanzhao` | 748–779 | `南诏王` |
| 异牟寻 `yimouxun` | 南诏 `nanzhao` | 779–808 | `南诏王` |
| 劝丰祐 `quanfengyou` | 南诏 `nanzhao` | 824–859 | `南诏王` |

Each claim will use `datePrecision: range`, `perspective: person`, `evidenceType: explicit-record`, `confidence: high`, both existing source IDs, and a non-empty uncertainty note that keeps the ruler's personal period distinct from the 738 Nanzhao formation event.

## Boundaries

- Do not create `served` claims for ordinary officials or military ministers.
- Do not infer governance from shared dynasty, city, event participation, or succession alone.
- Do not modify coverage logic, components, kinship/alliance/heritage files, or existing baseline tests.
- Add only the requested round107 claims, an isolated validation/coverage test, and the round107 audit document, besides this design/plan record required by the workflow.

## Verification

The new test will assert endpoint resolution, valid dates, valid source IDs, non-empty uncertainty notes, direct office backing, `validateClaims(...) === []`, and governance missing count `23`. It will be run directly, followed by the existing person-relationship coverage regression.
