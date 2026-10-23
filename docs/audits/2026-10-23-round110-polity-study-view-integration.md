# Round 110 政权学习视图详情关联集成审计

日期：2026-10-23  
范围：`buildPolityStudyView`、政权详情学习入口和政权关系面板；不修改 `claims.ts`、`people.ts`、`events.ts`、heritage 数据或 Round 109 审计。

## 结论

Round 109 记录的 116 个“当前事实学习集合”缺口中，实际新增 110 个安全的详情关联学习入口；另有 6 个继续保留边界。详情关联入口统一标注为“仅表示详情关联，不等同于本年事实”。

| 类别 | Round 109 缺口 | 新增详情关联入口 | 仍保留边界 |
| --- | ---: | ---: | ---: |
| 人物 | 1 | 1 | 0 |
| 事件 | 5 | 0 | 5 |
| 遗产 | 110 | 109 | 1 |
| 合计 | 116 | 110 | 6 |

## 实施边界

- `StudyData` 增加可选 `polityDetails`，政权 `InfoPanel` 传入真实 `polityDetails`；城市视图调用保持兼容。
- `PolityStudyView.people/events/heritage/claims` 的当前事实集合继续使用原有年份、有效期和来源过滤。
- 新增 `detailLinkedPeople`、`detailLinkedEvents`、`detailLinkedHeritage`，只承载可解析的 `PolityDetail` 导航入口。
- 详情事件若存在 `eventDetails`，仍必须通过显式 `polityIds`；因此详情引用不会覆盖事件详情中的明确排除。
- 详情遗产按自身 `constructionFrom`/`constructionTo` 过滤；跨政权共享遗产只显示为详情关联，不进入关系网络或当前事实集合。
- 详情关联事件保留事件目录年份和 `datePrecision` 展示；未精确时不被改写成确定年份。

## 保留的 6 项边界

### 事件（5）

- `wei_three:jin-unification`
- `shu_three:jin-unification`
- `jin_eastern:jin-unification`
- `zhou_northern:western-wei-founded`
- `zhou_northern:sui-founded`

这些事件的 `eventDetails.polityIds` 没有把事件明确归入对应当前政权；其中部分事件还超出政权有效期。它们继续可从原详情/事件目录核验，但不进入当前政权学习事实或详情关联入口。

### 遗产（1）

- `wu_zhou:shangyang-palace-site`

其遗产建设有效期不覆盖 Round 109 采用的政权起始学习年份，因此不通过详情关联入口跨越自身有效期。

## 验证

定向测试：

```bash
npm test -- --run src/domain/study-view.test.ts src/components/StudyRelationsPanel.integration.test.tsx
npm test -- --run src/data/polity-detail-round110-learning.integration.test.ts
```

Round 110 独立回归测试：2 tests passed；定向学习视图与组件测试：11 tests passed。

最终 `tsc`、build 和全量测试结果以本次交付报告为准。
