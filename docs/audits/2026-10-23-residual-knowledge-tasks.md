# 2026-10-23 残留 KnowledgeCoverageReport 任务审计

## 审计范围

本轮针对当前 `KnowledgeCoverageReport` 的残留任务复核：

- 人物关系：`tufa-wugu`。
- 事件参与人物：`changan-gengshi`、`changan-former-qin`、`tang-changan-end`；`changan-han-capital`、`white-horse-temple-founded` 与 `daming-palace-built` 已闭合。`tufa-wugu` 的人物关系缺口也已闭合。

审计只使用当前人物、事件详情、事件来源和年代字段。没有修改组件或 `knowledge-coverage.ts`。

## 本轮补充

| 事件 | 人物 | 直接依据 | 处理 |
| --- | --- | --- | --- |
| `changan-gengshi`（25年） | 刘秀 `liu-xiu` | 事件因果直接写明“刘秀势力重建”使更始政权在长安的控制基础削弱；人物生卒为前5—57年、任职段覆盖25—57年；人物、事件和详情共享 `zizhi-tongjian` | 补为直接阶段性参与；不扩展为刘秀单独攻占长安或全国统一 |
| `tang-changan-end`（907年） | 朱温 `zhu-wen` | 事件结果直接涉及唐亡与后梁建立；人物详情明确其907年建立后梁，任职段覆盖907—912年；人物、事件和详情共享 `zizhi-tongjian` | 补为直接阶段性参与；不把后梁都城或后续五代活动回填为长安参与 |

本轮新增秃发氏人物端点与 3 条人物关系，补齐白马寺 1 条直接参与记录、前秦苻健人物端点、大明宫 2 条角色级事件参与记录，并建立南凉—乐都候选遗产历史层；所有本轮审计任务均已闭合，遗产候选仍保留考古不确定性。

## 本轮任务闭合记录

| 任务 | 边界结论 |
| --- | --- |
| `person-person-relationship-missing:tufa-wugu` | 已闭合：新增秃发利鹿孤、秃发傉檀人物端点，并依据《晋书》卷一二六补入兄弟与乌孤任用关系；未添加未经证实的联盟或敌对关系。 |
| `event-participant-missing:changan-han-capital` | 已闭合：事件主年份校正为前200年，详情补入刘邦直接参与、萧何情境参与，并记录《资治通鉴》卷十一的角色级来源说明。 |
| `event-participant-missing:white-horse-temple-founded` | 已闭合：新增刘庄人物端点，并依据官方白马寺资料将其标注为直接参与者；求法链人物暂不从叙事背景自动扩展。 |
| `event-participant-missing:changan-former-qin` | 已闭合：新增苻健人物端点，并依据《晋书》卷一一二与事件详情将苻健限定为351年早期据长安人物；苻坚仍单独保留为357年后的统治者。 |
| `event-participant-missing:daming-palace-built` | 已闭合：补入李世民直接主持早期营建、李渊情境参与，并以《唐会要》卷三十拆分634年启动、635年改名和662—663年重建阶段。 |
| `polity-heritage-missing:southern_liang` | 已闭合：建立南凉—乐都候选历史层，关联399年迁都乐都的《太平御览》文献与文旅部今日乐都文化展示资料；实体状态保持 `uncertain`，不把展示设施宣称为南凉原构。 |

## 定向审计结论

数据变更后，目标任务集合应精确收敛为空；`changan-gengshi`、`tang-changan-end`、`changan-han-capital`、`white-horse-temple-founded`、`changan-former-qin`、`daming-palace-built`、`tufa-wugu` 与 `southern_liang` 不再产生对应缺口。对应断言位于 `src/data/residual-knowledge-tasks.test.ts`。
