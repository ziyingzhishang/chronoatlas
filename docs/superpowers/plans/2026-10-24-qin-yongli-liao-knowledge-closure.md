# 秦襄公、永历终结与辽五京知识闭环实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Follow test-driven development. Each task must write a failing test before changing production data.

**Goal:** 继续扩展政权—人物—事件—城市—遗产图谱，完成三个当前独立且高价值的历史知识闭环。

**Architecture:** 沿用现有静态历史目录模型，以事件详情作为人物、政权、地点和遗产的交汇节点；每个新增历史判断都保留来源、日期精度和不确定性边界。三个任务分别只修改自己的实体链与对应审计测试，最后由主线运行全量覆盖构建和测试。

**Tech Stack:** TypeScript, React data catalogs, Vitest, Vite knowledge-coverage generator.

## Global Constraints

- 不把同一政权的形成、即位、迁都、改革、终结压缩成重复事件。
- 约年、区域地点和候选遗产必须保留 `approximate`、`regional` 或不确定性说明，不能升级为精确事实。
- 事件参与者必须有可解析人物实体、事件详情字段和来源；上下文人物不得标成直接参与者。
- 每个任务先写失败测试并确认失败，再写最小生产数据变更。

### Task 1: 秦襄公人物与秦国形成节点闭环

**Files:**
- Modify: `src/data/people.ts`, `src/data/person-details.ts`, `src/data/event-details.ts`, `src/data/polity-details.ts`, `src/data/claims.ts`
- Test: `src/data/qin-xiangong-closure.test.ts`

**Acceptance:** 新增唯一 `qin-xiangong` 人物；秦国约前770年事件中秦襄公为 direct，秦穆公和秦孝公为 contextual；新增参与和统治 claims；不新增重复秦国建立事件，也不把咸阳绑定为前770年秦襄公地点。

- [x] 写测试并运行 `npm test -- --run src/data/qin-xiangong-closure.test.ts`，确认实体缺失导致失败。
- [x] 最小实现人物、详情、事件参与者角色、秦政权主要人物和 claims。
- [x] 重跑专项测试并确认通过。

### Task 2: 永历政权终结的昆明—阿瓦分层链

**Files:**
- Modify: `src/data/places.ts`, `src/data/people.ts`, `src/data/events.ts`, `src/data/event-details.ts`, `src/data/claims.ts`, `src/data/person-details.ts`, `src/data/polity-details.ts`
- Test: `src/data/yongli-termination-closure.test.ts`

**Acceptance:** 新增昆明城市和阿瓦区域地点、吴三桂人物、1662年永历终结事件；主地点为昆明，详情地点同时包含阿瓦和昆明；朱由榔与吴三桂参与关系可解析；吴三桂归入清方，不把俘获、押解和昆明终结误写成同一地点或单日过程。

- [x] 写测试并确认地点、人物、事件缺口真实失败。
- [x] 最小实现四类实体和关系，日期与地点精度按专家边界落盘。
- [x] 重跑专项测试并确认通过。

### Task 3: 辽五京城市—遗产视角补全

**Files:**
- Modify: `src/data/heritage.ts`, `src/data/heritage-details.ts`, `src/data/polity-details.ts`
- Test: `src/data/liao-five-capitals-closure.test.ts`

**Acceptance:** 东京辽阳、南京析津、中京大定、西京大同四个既有城市节点各自至少有可解析遗产详情或城市历史事件关联；不新增重复辽国建立事件；保留各地点现代对应范围和证据等级。

- [x] 写测试并确认四城遗产链缺失导致失败。
- [x] 为每城补最小历史遗产条目、现代地名说明、来源和辽政权关联。
- [x] 重跑专项测试并确认通过。

### Final verification

- [x] 运行 `npm run build:knowledge-coverage`，确认 `tasks: 0` 且没有新的 unresolved 引用。
- [x] 运行 `npm run build`。
- [x] 运行 `npm test -- --run --maxWorkers=1 --minWorkers=1`。
- [x] 更新审计文档，记录新增节点、日期/地点边界和覆盖数量变化。
