# 2026-10-23 残留 KnowledgeCoverageReport 任务审计

## 审计范围

本轮针对当前 `KnowledgeCoverageReport` 的 7 项真实任务复核：

- 人物关系：`tufa-wugu`。
- 事件参与人物：`changan-han-capital`、`changan-gengshi`、`white-horse-temple-founded`、`changan-former-qin`、`daming-palace-built`、`tang-changan-end`。

审计只使用当前人物、事件详情、事件来源和年代字段。没有修改组件或 `knowledge-coverage.ts`。

## 本轮补充

| 事件 | 人物 | 直接依据 | 处理 |
| --- | --- | --- | --- |
| `changan-gengshi`（25年） | 刘秀 `liu-xiu` | 事件因果直接写明“刘秀势力重建”使更始政权在长安的控制基础削弱；人物生卒为前5—57年、任职段覆盖25—57年；人物、事件和详情共享 `zizhi-tongjian` | 补为直接阶段性参与；不扩展为刘秀单独攻占长安或全国统一 |
| `tang-changan-end`（907年） | 朱温 `zhu-wen` | 事件结果直接涉及唐亡与后梁建立；人物详情明确其907年建立后梁，任职段覆盖907—912年；人物、事件和详情共享 `zizhi-tongjian` | 补为直接阶段性参与；不把后梁都城或后续五代活动回填为长安参与 |

本轮没有新增人物关系，也没有超过 2 条事件参与记录。

## 仍保留的 5 项任务

| 任务 | 边界结论 |
| --- | --- |
| `person-person-relationship-missing:tufa-wugu` | 现有目录只有秃发乌孤的人物、南凉政权关系和政权后续继承概述，没有第二个已建模人物端点及直接亲属、君臣、联盟或对立证据；不创建虚构端点，也不把 `founded` / `ruled` 改写成人物—人物关系。 |
| `event-participant-missing:changan-han-capital` | 刘邦、萧何等人物与前202年在年代上相容，但当前事件详情没有直接参与字段或直接点名其参与该定都事件；西汉身份、长安关联和关键事件导航不足以回填参与者。 |
| `event-participant-missing:white-horse-temple-founded` | 现有详情与官方来源支持68年创建传统、洛阳地点和历代重修边界，但没有已建模人物被来源和详情共同明确为该创建事件参与者；不从东汉皇帝或佛教传播背景推断。 |
| `event-participant-missing:changan-former-qin` | 前秦据长安事件为351年；苻坚人物任职从357年开始，年代不闭合。不能把前秦政权身份或后续前秦扩张回填到351年。 |
| `event-participant-missing:daming-palace-built` | 李治与武则天等人物的时间或政权背景可关联，但现有详情只支持营建城市节点，未直接证明其参与634年启动工程；唐代宫廷使用者不等于营建参与者。 |

## 定向审计结论

数据变更后，目标任务集合应精确收敛为以上 5 项；`changan-gengshi` 与 `tang-changan-end` 不再产生事件参与缺口。对应断言位于 `src/data/residual-knowledge-tasks.test.ts`。
