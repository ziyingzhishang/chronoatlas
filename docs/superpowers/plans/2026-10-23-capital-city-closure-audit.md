# 首都与城市视角安全闭合审计计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不扩大史实断言的前提下，复核首都、城市研究视图和政权详情的当前闭合候选；若不存在同时满足来源、时间、地点、政权端点且语义不冲突的候选，则固化精确的审计边界。

**Architecture:** 复用现有 `capitalHistory`、事件详情、遗产详情和政权详情目录，采用 round123 已建立的 15 项残余集合。新增独立审计测试，要求每项残余至少命中一个不可由字段解析替代的语义阻断；同步写入审计文档，不修改人物关系或事件详情主文件。

**Tech Stack:** TypeScript, Vitest, Markdown。

## Global Constraints

- 只写入 `src/data` 中 capital/city 相关测试、以及 capital/city 相关文档。
- 不新增或修改人物关系、事件详情、遗产事实、地点事实和政权事实主数据。
- 不把共享事件、跨政权遗产、连续考古层、约址或重复事件升级为单一政权闭合事实。
- 不提交当前工作树已有的用户改动。

---

### Task 1: 固化 round124 安全闭合门槛

**Files:**
- Create: `src/data/capital-city-round124-boundary.test.ts`

**Interfaces:**
- Consumes: `capitalHistory`, `events`, `eventDetails`, `heritageAssets`, `heritageDetails`, `polityDetails`, `sources`。
- Produces: 对 round123 的 15 项残余逐项验证安全闭合门槛和阻断分类的测试。

- [ ] **Step 1: Write the failing test**

  定义 15 项残余及其阻断类型，检查每项来源、时间、地点、政权端点均可解析，并要求每项至少一个语义阻断；同时要求不存在可直接加入政权详情的候选。

- [ ] **Step 2: Run test to verify it fails**

  Run: `npm test -- --run src/data/capital-city-round124-boundary.test.ts`

  Expected: FAIL because the new audit test does not exist yet.

- [ ] **Step 3: Write minimal implementation**

  仅新增审计测试，不修改生产数据。测试将残余集合与 `getPolityDetail()` 的已有关联对照，按事件/遗产类型验证边界条件。

- [ ] **Step 4: Run test to verify it passes**

  Run: `npm test -- --run src/data/capital-city-round124-boundary.test.ts`

  Expected: PASS。

### Task 2: 写入精确审计边界文档

**Files:**
- Create: `docs/audits/2026-10-23-round124-capital-city-boundary.md`

**Interfaces:**
- Consumes: round123 审计、round124 测试、当前 coverage 命令结果。
- Produces: 说明当前覆盖数、15 项残余、每类阻断和下一轮允许关闭条件的审计记录。

- [ ] **Step 1: Record the current baseline**

  写明首都覆盖 87/79、8 个未闭合证据边界，政权详情 87/87，round123 城市/首都残余 15 项。

- [ ] **Step 2: Record the no-closure conclusion**

  明确本轮没有安全补全候选，因此不修改生产数据；逐类列出 15 项残余及阻断理由。

- [ ] **Step 3: Record verification commands**

  写入 round124 定向测试、round123 边界测试、首都/政权详情覆盖测试和 `npm run audit:coverage`。

### Task 3: 回归验证与范围审计

**Files:**
- Modify: none

- [ ] **Step 1: Run capital/city/polity-detail tests**

  Run: `npm test -- --run src/data/capital-city-round124-boundary.test.ts src/data/capital-reference-round123-boundary.test.ts src/data/capital-coverage.test.ts src/data/polity-detail-global-coverage.test.ts src/data/city-perspective-round103.audit.test.ts`

- [ ] **Step 2: Run coverage audit**

  Run: `npm run audit:coverage`

- [ ] **Step 3: Check changed-file scope**

  Run: `git status --short` and confirm only the new capital/city test and audit/plan documents are changed in addition to the pre-existing user modification, with no production data or人物关系/事件详情主文件 changes。
