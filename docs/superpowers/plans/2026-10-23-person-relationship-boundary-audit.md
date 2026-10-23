# 人物关系缺口边界审计实施计划

> **For agentic workers:** 本计划仅新增审计测试与审计文档，不修改生产关系数据或已有用户文件。

**目标：** 固化当前 23 项 governance 与 10 项 eventParticipation 缺口均无安全候选的审计结论。

**方案：** 新增一个合并 Vitest 边界测试，读取现有人物、政权、事件、事件详情、来源和关系 coverage，验证两类缺口数量、候选证据契约及排除边界；新增一份 dated audit 文档，记录逐项结论和测试结果。

**范围约束：** 不修改 `src/data/claims.ts`、`src/data/event-details.ts`、`src/data/people.ts`、`src/data/person-details.ts`、`src/data/events.ts` 或既有测试；保留用户已有的 `docs/audits/2026-10-20-short-gap-decisions.md` 改动。

## Task 1：新增合并边界测试

**文件：** `src/data/person-relationship-round111-boundary.test.ts`

- 先写测试并确认因审计文档缺失而失败。
- 校验 governance 缺口完整为 23 项，并筛选明确君主/统治职衔、有效政权端点、完整年代和可解析来源的 office，结果必须为空。
- 校验 eventParticipation 缺口完整为 10 项，并筛选 direct participant、时间相容、人物/事件/详情共享来源的候选，结果必须为空。
- 校验 contextual participant、出生年代晚于事件、无详情端点或无直接参与字段均不能进入候选。

## Task 2：新增审计文档并转绿

**文件：** `docs/audits/2026-10-23-round111-person-relationship-boundary.md`

- 记录 governance 23 项和 eventParticipation 10 项的逐项名单。
- 记录治理候选的 office、端点、日期、来源闭合检查均为空。
- 记录事件候选的 direct participant、时间和共享来源检查均为空，并说明李治 contextual 记录、后续统治者时序冲突和无详情端点的排除理由。
- 记录定向测试命令与结果。

## Task 3：回归与工作树检查

- 运行新增合并测试及现有 round107/108/110、coverage 测试。
- 检查 `git diff --stat` 与 `git diff --name-only`，确认只新增本轮审计文件，用户已有未提交文件内容未变，生产关系数据未变。
