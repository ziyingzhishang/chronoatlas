# 事件完整详情入口审计

日期：2026-10-23

## 审计范围

本次只补齐事件主流程的完整详情入口，覆盖：

- 事件搜索结果中的 `EventDetailCard`
- `InfoPanel` 选中事件摘要
- `App` 到现有 `EntityDrawer` 的事件打开回调
- 事件详情内关联实体的继续导航

不修改事件数据、`EventDetail.tsx`、关系图谱或事件详情内容模型。

## 实施结论

### 1. 搜索结果卡片

`EventDetailCard` 在收到 `onOpenEntity` 时显示可访问按钮“打开完整事件详情”，点击调用：

```ts
onOpenEntity({ type: 'event', id: event.id })
```

原有事件前一年、事件后一年、定位和返回事件列表行为保持不变；未传回调时入口不显示，卡片仍可作为只读摘要使用。

### 2. 选中事件摘要

`InfoPanel` 的事件摘要在收到 `onOpenEntity` 时显示同名入口，仍保留事件标题、摘要和当前年份上下文。点击直接进入完整事件实体，不在摘要面板内展开详情。

### 3. 抽屉与关联导航

`App` 使用既有 `openDetail` 回调打开事件实体，因此沿用 `EntityDrawer` 的 50vw 桌面宽度和 `detailHistory` 返回层级。事件抽屉将共享回调通过 `onOpenEntity` 传给 `EventDetail`，参与者、政权、地点和关联事件仍可继续打开对应实体，不回退为纯文本。

## 回归证据

- `EventDetailCard.test.tsx`：完整事件入口调用正确的实体类型和 ID。
- `InfoPanel.test.tsx`：选中事件摘要入口调用正确的实体类型和 ID。
- `App.test.tsx`：搜索结果卡片打开 50vw 事件抽屉，并验证事件抽屉内人物关联可继续进入人物抽屉。

验证命令：

```bash
npm test -- --run src/components/EventDetailCard.test.tsx src/components/InfoPanel.test.tsx src/app/App.test.tsx
npm run build
git diff --check
```

本轮没有新增历史事实，也没有修改用户已有审计文件。
