# 南凉与赵国事件链 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修正南凉与南朝梁共用事件 ID 的政权语义冲突，并补齐赵武灵王改革事件的人物—政权—城市—遗产关联。

**Architecture:** 南凉新增独立的397年形成节点，保留南朝梁现有502年节点；南凉399年迁都乐都作为同一事件详情的阶段或独立城市事件，避免继续复用错误 ID。赵武灵王事件作为政权内部改革节点接入现有赵国与邯郸、赵王城遗产数据，不改变赵国建政节点。

**Tech Stack:** TypeScript, React data catalogs, Vitest, Vite coverage generator.

## Global Constraints

- 不把南凉与南朝梁视为同一政权；必须保持 `liang_southern` 与 `southern_liang` 的 ID 边界。
- 不把赵武灵王改革写成赵国建政事件；前403年建政节点保持不变。
- 地点只表达已有证据支持的历史城市或区域参照，不把现代城市中心当作古城精确边界。
- 每个新增事件必须同步事件详情、政权详情、人物详情或 claims、遗产关联（如有）、专项测试和覆盖报告。

### Task 1: 修正南凉事件语义

**Files:**
- Modify: `src/data/events.ts`
- Modify: `src/data/event-details.ts`
- Modify: `src/data/polity-details.ts`
- Modify: `src/data/claims.ts`
- Modify: `src/data/heritage-details.ts`
- Test: `src/data/southern-liang-event-chain.test.ts`

- [ ] **Step 1: Write the failing test**

断言南朝梁事件只属于 `liang_southern`，南凉必须拥有独立事件、人物和乐都阶段关联。

- [ ] **Step 2: Run the focused test and confirm the existing shared-ID failure**

Run: `npm test -- --run --maxWorkers=1 --minWorkers=1 src/data/southern-liang-event-chain.test.ts`

Expected: FAIL because `southern-liang-founded` currently belongs to both `liang_southern` and `southern_liang`.

- [ ] **Step 3: Add the minimal separated event and graph edges**

新增 `southern-liang-founded-397`，主地点使用 `xiping`，详情关联 `southern_liang`、秃发乌孤和现有乐都遗产；从南朝梁事件和详情中移除 `southern_liang`，并更新南凉政权的事件与 claim ID。

- [ ] **Step 4: Run focused tests and coverage checks**

Run: `npm test -- --run --maxWorkers=1 --minWorkers=1 src/data/southern-liang-event-chain.test.ts src/data/relationship-gap-closure.audit.test.ts src/data/southern-liang-heritage-boundary.test.ts`

Expected: PASS with no unresolved references and no duplicate cross-polity event ownership.

- [ ] **Step 5: Commit the isolated repair**

```bash
git add src/data/events.ts src/data/event-details.ts src/data/polity-details.ts src/data/claims.ts src/data/heritage-details.ts src/data/southern-liang-event-chain.test.ts
git commit -m "fix: separate southern liang event semantics"
```

### Task 2: Add Zhao Wuling reform event

**Files:**
- Modify: `src/data/events.ts`
- Modify: `src/data/event-details.ts`
- Modify: `src/data/person-details.ts`
- Modify: `src/data/polity-details.ts`
- Modify: `src/data/claims.ts`
- Modify: `src/data/heritage-details.ts`
- Test: `src/data/zhao-wuling-reform.test.ts`

- [ ] **Step 1: Write the failing test**

断言 `zhao-wuling-reforms-307`、赵武灵王参与 claim、赵国政权事件关联和邯郸遗产事件关联存在且不替代 `zhao-warring-founded-eighth-batch`。

- [ ] **Step 2: Run focused test and verify failure**

Run: `npm test -- --run --maxWorkers=1 --minWorkers=1 src/data/zhao-wuling-reform.test.ts`

Expected: FAIL because the event ID and graph edges do not exist.

- [ ] **Step 3: Add the event and relationships**

新增前307年约年改革事件，使用 `handan` 作为区域城市参照；补人物详情 key event、赵国 eventIds/turning point、人物参与 claim，并在赵王城遗产详情中添加关联事件。

- [ ] **Step 4: Run focused and full regression tests**

Run: `npm test -- --run --maxWorkers=1 --minWorkers=1 src/data/zhao-wuling-reform.test.ts src/data/person-event-participation-ninety-eighth-batch.test.ts src/data/capital-history.test.ts`

Expected: PASS; then run the repository-wide test suite.

### Task 3: Regenerate and verify release artifacts

**Files:**
- Modify: `internal/audits/knowledge-coverage.json`
- Create or modify: `docs/audits/2026-10-24-southern-liang-zhao-event-chain.md`

- [ ] **Step 1: Regenerate coverage**

Run: `npm run build:knowledge-coverage`

- [ ] **Step 2: Verify no unresolved references or actionable tasks**

Run: `npm test -- --run --maxWorkers=1 --minWorkers=1` and `npm run build`.

- [ ] **Step 3: Check the diff and commit the batch**

Run: `git diff --check && git status --short`, then commit only the intended data, tests, coverage report and audit document.
