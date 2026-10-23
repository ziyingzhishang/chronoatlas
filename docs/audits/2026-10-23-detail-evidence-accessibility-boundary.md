# 详情抽屉证据与可达性一致性边界

## 审查范围

本轮只审查 `EventDetail`、`HeritageDetail`、`PersonDetail` 的摘要/详情结构、来源链接、i18n 文案和键盘/ARIA 可达性。未修改领域数据、关系图谱或抽屉容器。

## 已验证并修复

1. `PersonDetail` 的人物来源记录此前始终以普通文本渲染；当来源记录包含 HTTP(S) URL 时，键盘用户无法通过链接进入来源。现改为与遗产详情一致：URL 来源标题渲染为新窗口链接，纯书目引文仍保留为文本。
2. `EventDetail` 此前只要存在 `urlOrCitation` 就渲染 `<a>`，因此《资治通鉴》卷次这类非 URL 书目引文会产生无效链接。现仅对 `http://` 和 `https://` 开启链接，非 URL 引文按普通来源标题展示。

## 保留项与未扩展范围

- `HeritageDetail` 上一轮已完成的来源链接、来源展开详情和相关实体键盘导航保持不变。
- 三类详情均保留可访问的 `article` 名称；分组详情使用原生 `details/summary`，实体关系使用原生 `button`，本轮未引入重复的自定义键盘处理。
- 当前已有中文/英文共享 `t()` 文案覆盖本轮涉及的结构标签；没有新增文案键，避免形成未同步的语言分支。
- 本轮未扩展来源 URL 解析器、未拆分多 URL 书目字符串，也未改变任何来源数据。

## 验证

- `src/components/EventDetail.test.tsx`：新增非 URL 书目不应成为链接的回归测试。
- `src/components/PersonDetail.test.tsx`：新增 URL 来源可通过链接访问的回归测试。
- `src/components/HeritageDetail.test.tsx`：复跑上一轮遗产来源链接与结构测试。

