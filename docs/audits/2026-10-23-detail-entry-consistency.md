# 详情入口一致性审计

日期：2026-10-23

## 审计范围

本次只检查摘要卡到实体详情抽屉的入口一致性，覆盖：

- `InfoPanel` 的本年事件摘要
- `PersonDetail` 的关键事件、人物关系和事件参与入口
- `EventDetail` 的参与者、参与政权、关联地点和关联事件入口
- `HeritageDetail` 的关联人物、政权、事件和现代地点入口
- `EntityDrawer` 的宽度、层级、返回历史和证据展示契约

领域数据、coverage 引擎和关系图谱不在本次修改范围内。

## 发现与修复

### 1. InfoPanel 本年事件摘要缺少实体入口

审计前事件摘要使用纯文本段落，已有 `onOpenEntity` 时也不能打开事件详情。

修复为：事件标题使用按钮，点击调用现有回调：

```ts
onOpenEntity({ type: 'event', id: event.id })
```

事件摘要仍保留原有摘要文字；未传回调时继续以非交互文本降级。

### 2. EventDetail 未接受统一回调名

`PersonDetail`、`HeritageDetail` 和 `InfoPanel` 已使用 `onOpenEntity`，而 `EventDetail` 仅接受 `onNavigate`。在调用方统一传入 `onOpenEntity` 时，事件详情中的所有关联实体会退化为纯文本。

修复为 `EventDetail` 增加 `onOpenEntity`，并以 `onNavigate ?? onOpenEntity` 作为统一导航函数；保留 `onNavigate`，不破坏既有调用方。参与者、政权、地点和关联事件全部使用该函数。

## 未发现缺口的部分

- `PersonDetail` 的关键事件和关系项已通过 `onOpenEntity` 打开人物、政权、事件或遗产详情；关系项的来源可解析状态和不确定性仍保留。
- `HeritageDetail` 已将 `onNavigate ?? onOpenEntity` 统一为同一导航函数，关联人物、政权、事件和现代地点均可进入详情。
- `EventDetail` 和 `HeritageDetail` 的来源及不确定性区域仍在详情内容中展示；本次未修改其证据内容。

## 抽屉契约核验

- `EntityDrawer` 未修改。
- 详情入口仍由应用层现有 `openDetail` 处理，实体切换继续形成可返回的 `detailHistory`。
- 桌面端抽屉继续使用 `width: 50vw`，移动端继续使用 `100vw`；现有事件、遗产、城市和政权抽屉回归测试保持通过。
- 本轮没有新增嵌套抽屉，也没有在摘要卡内展开完整详情。

## 回归证据

- 相关组件与应用回归：6 个测试文件、50 个测试全部通过。
- 构建：`npm run build` 通过。
- 差异检查：`git diff --check` 通过。

新增定向回归：

- `InfoPanel.test.tsx`：本年事件摘要使用 `onOpenEntity` 打开事件。
- `EventDetail.test.tsx`：事件关联实体接受统一的 `onOpenEntity` 回调。
