# 学习视图过渡事件入口审计

日期：2026-10-23  
范围：`src/domain/study-view.ts`、`src/components/StudyRelationsPanel.tsx` 及对应测试；不修改 `claims`、`people`、`events`、`heritage` 数据。

## 结论

政权学习视图继续把普通 `events` 限定为截至所选年的事件，并优先服从事件详情中的显式 `polityIds`。对于政权详情引用、但事件详情没有把当前政权列入显式归属的五个过渡事件，新增独立的 `detailLinkedTransitionEvents` 学习入口：

- `wei_three → jin-unification`
- `shu_three → jin-unification`
- `jin_eastern → jin-unification`
- `zhou_northern → western-wei-founded`
- `zhou_northern → sui-founded`

它们不会进入普通 `events`、关系网络或本年事实列表。入口统一标注“关联但非本年事实”，并继续打开现有实体详情抽屉。

## 边界与可解释性

- 过渡入口不使用当前年份重新判断事件事实性，因此不会因选年早于事件发生年而丢失政权详情中的学习入口。
- 事件的时间、显式政权归属和不确定性仍以事件详情证据为准；没有借用 `claims` 或数据目录补造归属。
- 遗产仍按自身 construction window 过滤；本轮没有放宽遗产时段边界。
- 人物、普通事件、遗产和首都地点已有的实体抽屉回调保持不变；桌面抽屉尺寸仍由现有 `50vw` 样式提供，移动端继续使用全宽布局。
- 新增过渡事件标题和边界提示在组件内提供中英文文案；其余既有未翻译关联文案不在本轮扩大范围内。

## 回归验证

```text
npm test -- --run src/domain/study-view.test.ts src/components/StudyRelationsPanel.integration.test.tsx
14 tests passed
```

对应测试覆盖：五项过渡事件的独立集合、普通 `events` 排除、两项按钮导航，以及中文和英文边界文案。
