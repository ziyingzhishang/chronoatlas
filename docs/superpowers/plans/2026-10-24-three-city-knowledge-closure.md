# 重庆金中都宛阳城市视角知识闭环实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补齐重庆、金中都、宛阳三个首都/政治中心城市视角的事件、人物、遗产与政权关联，并确保城市研究视图可显示这些节点。

**Architecture:** 延续现有 `HistoricalEvent`、`HistoricalEventDetail`、`Person`、`HeritageAsset` 与 `PolityDetail` 分层模型；摘要实体负责卡片，详情实体负责抽屉页，城市视图通过 `placeId` 与 `relatedPlaceIds` 聚合。宛阳复用现有遗产并修正事件地点，重庆只增加有来源的战时政治事件，金中都增加迁都事件、考古遗产和完颜亮人物端点。

**Tech Stack:** TypeScript, Vitest, 现有知识覆盖构建脚本。

## Global Constraints

- 不重复创建已有事件或遗产实体。
- 不把阶段性政治中心改写为全期固定首都。
- 不把城市遗址、现代建筑和古代原构混为一谈。
- 所有新增事件、人物、遗产必须有来源 ID 和对应详情链。
- 必须先写失败测试，再写生产数据；每批完成后运行定向测试、覆盖构建和全量回归。

### Task 1: 建立三城市闭环失败测试

**Files:**
- Create: `src/data/chongqing-city-closure.test.ts`
- Create: `src/data/jin-zhongdu-closure.test.ts`
- Create: `src/data/gengshi-wanyang-city-closure.test.ts`

- [ ] **Step 1: 写断言**：重庆断言战时事件、详情、政权链接；金中都断言人物、迁都事件、遗产、详情和政权链接；宛阳断言 `gengshi-founded` 的地点、详情地点以及 `buildCityStudyView` 在两个地点 ID 下都能看到事件和遗产。
- [ ] **Step 2: 运行定向测试确认失败**：`npx vitest run src/data/chongqing-city-closure.test.ts src/data/jin-zhongdu-closure.test.ts src/data/gengshi-wanyang-city-closure.test.ts --maxWorkers=1`；预期三组新断言因节点尚不存在而失败。

### Task 2: 补齐重庆战时中央驻地链

**Files:**
- Modify: `src/data/events.ts`
- Modify: `src/data/event-details.ts`
- Modify: `src/data/polity-details.ts`

- [ ] **Step 1: 新增 `republic-chongqing-wartime-center`**：1938—1945、`placeId: 'chongqing'`、区间精度、已有首都与现代地理来源；参与人物保持空数组。
- [ ] **Step 2: 新增事件详情**：关联 `republic`、`chongqing` 和 `republic-founded`，写明战时中央驻地不等同永久迁都或单一建筑遗产。
- [ ] **Step 3: 把事件 ID 加入中华民国政权详情**，保留原有南京、北京和重庆阶段。
- [ ] **Step 4: 运行重庆定向测试并通过**。

### Task 3: 补齐宛阳事件地点与城市视图

**Files:**
- Modify: `src/data/events.ts`
- Modify: `src/data/event-details.ts`

- [ ] **Step 1: 给 `gengshi-founded` 增加 `placeId: 'wan_nanyang'`**，不创建重复事件。
- [ ] **Step 2: 将详情地点扩为 `wan_nanyang`、`wanyang`、`luoyang`、`changan`**，保留迁移过程与刘玄、刘秀现有参与关系。
- [ ] **Step 3: 运行宛阳定向测试并通过**，确认两个城市 ID 均显示已有 `gengshi-wanyang-city-layer`。

### Task 4: 补齐金中都事件、人物与遗产链

**Files:**
- Modify: `src/data/sources.ts`
- Modify: `src/data/people.ts`
- Modify: `src/data/person-details.ts`
- Modify: `src/data/events.ts`
- Modify: `src/data/event-details.ts`
- Modify: `src/data/heritage.ts`
- Modify: `src/data/heritage-details.ts`
- Modify: `src/data/claims.ts`
- Modify: `src/data/polity-details.ts`

- [ ] **Step 1: 增加北京市官方金中都考古来源**。
- [ ] **Step 2: 增加完颜亮人物与详情**，用其关联1153年迁都，不能误连完颜阿骨打。
- [ ] **Step 3: 增加 `jurchen-jin-moves-zhongdu` 及详情**，关联 `jin_jurchen`、`jin_zhongdu` 和金建立事件。
- [ ] **Step 4: 增加 `jin-zhongdu-city-site` 及详情**，拆分1151—1153营建、1153—1214政治中心，明确辽南京、金中都、元大都、明清北京的历史层次。
- [ ] **Step 5: 增加人物参与和统治 claims，并把新事件、人物、遗产接入金政权详情**。
- [ ] **Step 6: 运行金中都定向测试并通过**。

### Task 5: 覆盖审计、回归与交付记录

**Files:**
- Create: `docs/audits/2026-10-24-three-city-knowledge-closure.md`
- Modify if needed: `internal/audits/knowledge-coverage.json`

- [ ] **Step 1: 运行 `npm run build:knowledge-coverage`**，确认三城市不再出现“已记录首都但无知识节点”。
- [ ] **Step 2: 运行 `npm run build` 与 `npm test -- --runInBand`**，修复仅由本批数据引起的回归。
- [ ] **Step 3: 在审计文档记录新增节点、来源、遗留不确定性和测试结果**。
- [ ] **Step 4: 提交本批变更**：`git add ... && git commit -m "feat: close chongqing zhongdu wanyang knowledge chains"`。
