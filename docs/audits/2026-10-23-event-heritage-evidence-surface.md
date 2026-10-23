# EventDetail / HeritageDetail 事件遗产证据面审计

## 审查范围

本轮只审查 `EventDetail` 与 `HeritageDetail` 的来源区、时间证据、不确定性和关联实体导航。未修改领域数据、`PersonDetail`、`InfoPanel` 或 `RelationshipGraph`。

## 真实缺口与修复

1. 来源目录中的 `luoyang-baimasi-official` 同时包含两个以中文分号分隔的 URL。此前两个详情组件把整条字符串作为一个 `href`，得到的链接不可直接访问。现在按分隔符解析 `http://`/`https://` URL，每个 URL 单独渲染为新窗口链接。
2. 来源 ID 无法在 `sourceById` 解析时，原界面只显示原始 ID，读者无法区分“书目引文”和“来源目录缺失”。现在明确展示 `来源未解析`；已解析来源按 `来源链接` 或 `书目引文` 标注。该状态同样覆盖遗产建造阶段的来源摘要。

## 保持不变的边界

- `EventDetail` 的时间证据审计继续展示确证、约年、未知状态及时间轴定位许可；本轮没有用来源链接状态替代时间精度判断。
- 两组件的参与者、政权、地点、关联事件和遗产关联项继续复用 `onNavigate ?? onOpenEntity`，没有新增导航路径。
- 非 URL 书目仍按文本展示，不生成伪链接；来源标题、引文说明和不确定性说明继续保留。
- 外链维持 `target="_blank"` 与 `rel="noreferrer"`，未改变来源内容。

## 验证

- `src/components/EventDetail.test.tsx`：覆盖关联导航、时间审计、非 URL 书目、多 URL 拆分和未知来源状态。
- `src/components/HeritageDetail.test.tsx`：覆盖阶段证据、来源外链、多 URL 拆分、未知来源状态及人物/政权/事件/地点导航。
- 定向测试：2 个测试文件、16 个测试通过。
- `npm run build`：通过。
- `git diff --check`：通过。
