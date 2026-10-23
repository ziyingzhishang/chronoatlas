# Knowledge coverage navigation audit

## Scope

This audit closes the navigation gap in `KnowledgeCoveragePanel`: an actionable
`KnowledgeCoverageTask` must open the existing entity detail drawer while the
complete coverage JSON remains available as an audit artifact.

## Navigation contract

- `KnowledgeCoverageTask.entityType` is used as `DetailEntity.type`.
- `KnowledgeCoverageTask.entityId` is used as `DetailEntity.id`.
- `KnowledgeCoveragePanel` accepts the existing `onOpenEntity` callback and
  does not create routes, look up substitute records, or synthesize data.
- `InfoPanel` passes its existing `onOpenEntity` callback into the coverage
  panel; `App.openDetail` remains the single drawer entry point.
- The panel heading keeps the independent `/data/coverage-audit.json` link.
- When a panel is rendered without the callback in isolation, the task label
  remains an audit JSON link as a safe fallback; the application path supplies
  the callback and opens the drawer directly.

## Accessibility and localization

Task subjects are keyboard-focusable buttons in the application path. Their
accessible names use the existing locale system:

- Chinese: `打开实体详情：{主体名称}`
- English: `Open entity details: {subject name}`

Tests cover the callback payload, the preserved audit link, and both Chinese
and English accessible names.

## Verification boundary

The implementation is limited to `KnowledgeCoveragePanel.tsx`, `InfoPanel.tsx`,
their corresponding tests, the existing English locale dictionary, and this
audit document. Domain data, `study-view.ts`, and `RelationshipGraph.tsx` are
unchanged.
