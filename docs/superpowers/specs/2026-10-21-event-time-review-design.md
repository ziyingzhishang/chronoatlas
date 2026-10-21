# 事件时间证据目录设计

## 目标

为当前审计识别的 37 个非精确事件时间建立可复核目录，使学习界面未来能够解释“为什么只能按约年、区间或未知时间展示”，同时不改变既有事件年份、`datePrecision` 或任何 UI。

## 设计

`src/data/event-time-review.ts` 保存每个事件的人工审阅元数据：`eventId`、`status`、解释和时间轴展示策略。证据来源与时间精度不复制到目录中，而由现有 `events` 和 `eventDetails` 在审计函数中读取；这样来源更新时不会产生第二份过期事实。

审计函数 `reviewEventTimeCoverage()` 默认读取当前事件目录，也接受事件和详情目录参数以便测试。它返回完整的审阅记录、状态计数、缺失事件、未解析来源、详情来源不一致和时间精度不一致；`isComplete` 只有在 37 个目标事件全部覆盖且每项详情存在、来源可解析、精度一致时为真。

状态语义：

- `confirmed`：现有证据支持当前事件的边界或区间粒度；不表示精确到日。
- `approximate`：只能支持传统纪年、形成阶段或约年锚点。
- `unknown`：现有证据不足以支持可用的时间锚点，时间轴应隐藏确定位置并解释原因。

时间轴策略限定为 `year-marker`、`approximate-marker`、`range-band`、`unknown-window`。目录不推算、不补年份；策略仅决定学习界面的解释方式。

## 验收

- 37 个现有非 `year` 事件一一覆盖。
- 每条报告记录的 `sourceIds` 来自对应 `eventDetail.sourceIds`，`datePrecision` 来自对应事件。
- 测试覆盖完整目录、来源/精度漂移、缺失目录和状态计数。
- 只新增事件时间目录及其测试（设计/计划文档除外），不修改政权详情、people/person-details 或 UI。
