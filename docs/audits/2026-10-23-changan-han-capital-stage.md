# 汉定都长安阶段核验

本轮核对 `changan-han-capital` 的年代语义和来源边界。前202年对应刘邦即皇帝位、汉初帝国秩序形成；《资治通鉴》卷十一记载高帝五年“帝西都洛阳”，高帝七年见萧何治宫室于长安后“乃迁都长安”。因此本项目不把前202年即位、前200年迁都和长安新城营建压缩为同一事件。

本轮变更：

- 事件摘要明确“长安首都阶段在后续迁都过程中确立”；
- 事件详情增加“前202年帝国秩序形成”和“前200年迁都长安”两个阶段；
- 新增《资治通鉴》卷十一的可打开来源记录；
- 保留现有参与人物缺口，不把刘邦或萧何的相关线索未经角色级事件记录直接升级为参与者；
- 事件详情补入刘邦（直接参与）与萧何（情境参与）两个角色，并以《资治通鉴》卷十一的同一记载分别说明迁都决定与宫室营建承接。
- 迁都事件主年份、长安首都阶段和 `capital-of` claim 统一为前200年；前202年只保留为汉初帝国秩序形成节点。
- 知识覆盖 residual tasks 由6项降为5项，`event-participant-missing:changan-han-capital` 已闭合。

来源：

- [《资治通鉴》卷十一](https://zh.wikisource.org/wiki/資治通鑑/卷011)，高帝五年至七年条目。

验证：

```text
npm test -- --run src/data/changan-han-capital-boundary.test.ts src/data/event-details.test.ts src/data/event-detail-coverage.test.ts
```

结果：3 个测试文件、28 个测试通过。
