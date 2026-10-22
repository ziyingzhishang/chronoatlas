# 第104轮玄奘遗产事件边界审计实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 核验现有五个玄奘相关遗产条目与 `xuanzang-translations` 缺失端点之间的证据边界，并只在现有资料足以支持统一事件时补录，否则固定不可安全拆分的边界。

**Architecture:** 以全局事件目录、事件详情和来源目录作为事件候选证据；以遗产详情的五个关联事件为反向引用。若缺少统一年代、地点集合、阶段链和覆盖来源，则维持悬空关联 ID，并通过审计文档与回归测试说明原因，不把建筑年代拼接为译经事件。

**Tech Stack:** TypeScript, Vitest, React/Vite data catalogs.

## Global Constraints

- 不凭空合并年代；建筑始建、寺院沿革和人物活动不互相替代。
- 不把 `tang-founded` 替代玄奘译经事件。
- 证据不足时保留 `needs-review` 和显式未解析事件端点。
- 保留工作区已有的 `docs/audits/2026-10-20-short-gap-decisions.md` 修改。

---

### Task 1: 建立第104轮失败回归测试

**Files:**
- Create: `src/data/heritage-event-round104-boundary.test.ts`
- Read: `src/data/events.ts`, `src/data/event-details.ts`, `src/data/sources.ts`, `src/data/heritage-details.ts`

- [x] **Step 1: 写断言**：枚举五个 `needs-review` 遗产，确认 `xuanzang-translations` 不在事件目录，且现有来源没有同时声明统一年代、五地集合、阶段链和译经参与者。
- [x] **Step 2: 运行定向测试并确认失败**：先以第104轮要求的边界文字断言运行，失败来自尚未写入的边界说明；修正了测试中把通用来源误当作事件候选的断言。

### Task 2: 根据证据做最小数据/审计修复

**Files:**
- Modify: `src/data/heritage-details.ts`
- Create: `docs/audits/2026-10-22-round104-xuanzang-heritage-boundary.md`

- [x] **Step 1: 若四项证据条件均不成立**：增强五个遗产详情的不确定性说明，明确 `xuanzang-translations` 仍是待核端点，并区分译经活动、寺院建筑年代和唐建立事件。
- [x] **Step 2: 若四项证据条件均成立**：不适用；现有证据未同时满足四项条件，未新增事件端点。
- [x] **Step 3: 运行定向测试并确认通过**。

### Task 3: 全量验证

- [ ] **Step 1:** 运行 `npm test -- --run`。
- [ ] **Step 2:** 运行 `npm run build`。
- [ ] **Step 3:** 运行 `git diff --check` 并检查工作区，确认未覆盖既有审计文档修改。
- [ ] **Step 4:** 提交仅属于第104轮的文件，保留其他工作区修改。
