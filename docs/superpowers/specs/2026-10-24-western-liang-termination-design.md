# 西凉终止链闭环设计

## 目标

补齐 `western_liang` 从 400 年建政、400—404 年敦煌阶段、405—421 年酒泉阶段，到 421 年被北凉攻灭的可学习闭环，并让人物、关系、遗产、来源和时间精度都可追溯。

## 边界与方案

- 只追加西凉相关事件、人物、详情、关系、酒泉遗产和专项测试；不修改南凉、前凉、吐谷浑关系基线。
- 使用已有 `zizhi-tongjian`、`china-chronology`、`jinshu-vol87-li-hao`、`zizhi-tongjian-vol111-western-liang`、`capital-history-reference`、`modern-geography-reference` 来源。
- 保留 400—404 敦煌与 405—421 酒泉两个首都阶段，421 终止事件采用年份精度；遗产层不等同于单一现存建筑。
- 终局人物为李歆，攻击与承接方为北凉沮渠蒙逊；关系保留时间边界和来源。

## 验证

独立测试覆盖实体、事件、人物、关系、首都阶段、现代地名、遗产、来源、时间边界、唯一 ID 与无孤立引用；随后运行专项测试、coverage、tsc、build 和 diff-check。
