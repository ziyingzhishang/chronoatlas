# 山河年轮公开发布与版本化离线数据设计

日期：2026-10-26  
状态：已批准的设计规格，待实施计划  
适用仓库：`chronoatlas`

## 1. 背景与结论

山河年轮计划以公开静态网页形式提供阅读，但原始 TypeScript、测试、研究台账与编辑流程不对外开放。当前数据已有内容仓库、版本清单、来源、审核、哈希和疆域研究任务等过渡性边界，但地图、时间轴和部分详情仍直接导入 `src/data/*`，数据与应用构建未真正分离。

本设计确定以下长期架构：

```text
内部编辑与治理
人工录入 / 自动提案 / 读者反馈
          ↓
史料、制图、权利、公开展示审核
          ↓
不可变发布修订
          ↓
版本化静态数据包 + 发布清单
          ↓
公开静态网页 / 本地离线仓库
```

首期采用“发布契约先行，数据库后置”：先把当前数据导出为可验证、可分包、可回滚的不可变发布物，再把编辑侧逐步迁移到 PostgreSQL/PostGIS 和对象存储。运行时客户端不直接连接编辑数据库。

## 2. 目标

1. 保留 private 源仓，仅公开构建后的前端与已审核数据。
2. 将地图、时间轴、详情和搜索收敛到同一版本的运行时数据快照。
3. 支持内容和疆域数据按包下载、本地安装、原子激活与回滚。
4. 为未来人工补全、自动化候选提案和读者反馈提供统一审核通道。
5. 将历史可信性、版权或许可、公开地图合规和技术发布状态分层管理。
6. 保持证据不足时的 `leave-unfilled`，不为了覆盖率自动填充疆域。

## 3. 非目标

- 首期不建设完整 CMS 或多人实时协作系统。
- 不等待全部历史数据迁移完成才建立发布骨架。
- 不做全球全时代单一大离线包。
- 不将 ArcGIS 等第三方在线瓦片当作已授权的离线资产。
- 不做基于最近年份、最大轮廓或生成模型的疆域自动回填。
- AI、脚本或读者反馈不得越过审核直接发布。
- 不将静态站点或离线缓存视为业务数据库。

## 4. 发布拓扑

### 4.1 首选：private 源仓直接发布

适用于 GitHub Pro、Team 或 Enterprise：

```text
private chronoatlas
  ├─ PR: 测试 + 数据验证 + 许可证审计 + 构建，不部署
  └─ main: 重新执行所有门禁
          ↓
     GitHub Pages artifact
          ↓
     public website
```

源仓、工作流日志与研究资料继续按 private 权限管理，公开面仅为 Pages artifact 中的静态文件。

### 4.2 GitHub Free 条件分支

若当前套餐不支持 private Pages：

1. 若不强制要求 GitHub Pages，优先使用能连接 private 源仓的静态托管。
2. 若必须使用 GitHub Pages，建立只包含可发布产物的 public 仓库。
3. 跨仓凭据必须限定到单一发布仓的最小写权限，不使用个人广域 token。
4. 发布仓不接受人工编辑；每次发布与源仓 commit、数据 release 和工作流运行双向追溯。

### 4.3 “闭源”边界

- `package.json` 的 `private: true` 仅防止 npm 发布，不是源码保护措施。
- 原始 TypeScript、测试、构建脚本可保持 private。
- 浏览器必须下载的 JavaScript、CSS、历史内容和地图数据必然可被读取与分析。
- 生产构建禁止 Source Map、inline source、测试、`.env`、Git 元数据和内部审计文档进入 artifact。
- 任何前端变量和 URL 均视为公开信息，不存放密钥。

## 5. 公开发布硬门禁

### 5.1 地图公开展示

当前 `public/data/map-release-compliance.json` 为 `research-only`，且缺少审图号与有效期。`npm run verify:map-release` 失败时不得部署到任何公开 URL。

禁止：

- 填写虚假审图号或调整验证脚本绕过门禁。
- 将“仅供研究”免责声明当作公开地图审核替代物。
- 将构建成功、资料有来源或学术不确定性处理等同于地图公开展示合规。

公开部署前必须有真实有效的审核结论、展示位置、必要标注和内容变更后的重新审核策略。

### 5.2 许可证与版权

发布前必须产出可公开查看的第三方清单，至少包含名称、版本、来源、许可证、署名、改动声明和完整许可文本。

特别处理：

- 明确项目原创代码继续 MIT 还是调整为专有许可；变更前确认版权归属与已有贡献授权。
- Cliopatria CC BY 4.0 数据保留署名、来源、许可链接和改动说明。
- Historical Basemaps GPL-3.0 几何目前会进入主 JavaScript bundle，在未完成专项许可证评估前不将该结构视为可发布；优先评估外置数据包、对应源提供和可替换数据源。
- 受限制扫描页、现代复原图、博物馆影像和未授权翻译不进入 public 或 offline-public 数据包。

### 5.3 技术门禁

CI 必须按顺序执行：

1. 锁定 Node 与包管理器版本，执行 `npm ci`。
2. 数据 schema、引用完整性、哈希和重复 ID 验证。
3. 全量测试与知识覆盖构建。
4. 地图公开展示验证。
5. 第三方许可证、敏感信息与不应公开文件扫描。
6. 使用 Pages 实际 `base` 生产构建。
7. 对构建产物再执行路径、Source Map、许可声明和文件大小审计。
8. 只上传 `dist` artifact。

PR 不部署。默认分支部署使用 `github-pages` environment，build job 只授予 `contents: read`，deploy job 只增加 `pages: write` 与 `id-token: write`。引用的 Actions 在实施时锁定到已审计 commit SHA。

## 6. 发布数据模型

### 6.1 根发布清单

新的发布契约使用不可变 manifest，`latest.json` 仅作为很小的可变指针：

```ts
interface ReleaseManifest {
  releaseId: string;
  schemaVersion: string;
  minimumAppVersion: string;
  parentReleaseId?: string;
  createdAt: string;
  channel: 'preview' | 'stable';
  complianceProfile: 'internal-research' | 'public-web' | 'offline-public';
  packages: ReleasePackage[];
}

interface ReleasePackage {
  id: string;
  kind: 'app-shell' | 'content' | 'territory' | 'world' | 'media';
  region?: string;
  yearRange?: [number, number];
  required: boolean;
  dependencies: string[];
  compressedBytes: number;
  recordCount: number;
  licenseIds: string[];
  files: ReleaseFile[];
}

interface ReleaseFile {
  uri: string;
  mediaType: string;
  sha256: string;
  bytes: number;
  collection: string;
  sourceDigest: string;
}
```

要求：

- `releaseId` 指向一个原子内容快照，文件 URL 带内容哈希且不可覆盖。
- 一个运行时会话固定于同一 `releaseId`，不得同时读取旧疆域与新事件。
- 所有年份均为无公元0年的公历年整数。
- `leave-unfilled` 是正式发布结论，不是未知异常。
- 内部研究任务、未审附件、原始反馈与审核备注不进入读者数据包。

### 6.2 分包

MVP 使用以下包：

- `app-shell`：HTML、JavaScript、CSS、字体与基础陆地轮廓。
- `core-zh`：政权、城市、人物、事件、关系、阅读详情与公开来源。
- `china-territory`：中国及周边疆域、替代表达、覆盖决策和必要署名。
- `world-<century>-<region>`：可选世界世纪或区域包。
- `media-*`：可选专题媒体。

地形与卫星底图不进入首期离线包。断网时退化到本地陆地轮廓与已安装历史数据，界面应明确说明底图不可用，而不将网络失败误报为历史数据缺失。

## 7. 编辑治理模型

### 7.1 编辑库

未来编辑侧使用 PostgreSQL/PostGIS，核心概念为：

- `entity`：稳定实体 ID 与类型。
- `entity_revision`：不可变修订、语言、前序版本和领域载荷。
- `assertion`：主语、谓词、宾语或值、时间、空间、视角与不确定性。
- `source` / `source_version` / `source_locator`：来源、固定版本、页码或条目、原文件哈希。
- `evidence_link`：修订或断言与来源定位的关联。
- `spatial_asset`：几何、表达类型、控制性质、对象 URI、哈希、许可与派生链。
- `submission` / `proposal_change`：人工、自动化和读者提案的统一入口。
- `review`：历史、制图、权利、公开展示与编辑审核。
- `territory_conflict`：几何冲突与解决结论。
- `release` / `release_item`：不可变发布快照。

MVP 可先以脚本与命令行进行导入、提案和审核，不以后台 UI 为前置条件。

### 7.2 对象存储

对象存储分为：

- `private/raw/`：扫描页、研究附件与受限资料。
- `staging/derived/`：待审 GeoJSON、制图中间产物和候选数据包。
- `public/releases/<releaseId>/`：已通过发布门禁的只读公开物。

数据库只保存 URI、SHA-256、字节数、MIME、许可、来源与派生链；大文件不嵌入业务表或 UI 模块。

### 7.3 统一提案流程

人工、自动化与读者入口均创建同类 `Submission`，至少包含：

- `origin: human | automation | reader`
- 提交者或自动化运行 ID
- 基准 `releaseId`
- 目标实体、字段、年份或坐标
- 建议变更、来源与定位
- 原始附件、许可声明、置信度和说明

状态流程：

```text
draft
→ validating
→ needs-evidence
→ historical-review
→ cartographic-review        # 空间数据必需
→ rights-review
→ publication-review
→ accepted / rejected / blocked
```

只有 `accepted` 修订能进入发布器。被拒绝、被替代与被阻塞的结论保留完整追溯链。

## 8. 运行时仓库与离线安装

### 8.1 运行时边界

```ts
interface HistoricalDataRepository {
  open(releaseId?: string): Promise<HistoricalSnapshot>;
}

interface HistoricalSnapshot {
  readonly release: ReleaseManifest;
  getEntity(kind: EntityKind, id: string): Promise<HistoricalEntity | undefined>;
  queryPolitiesAt(year: number): Promise<Polity[]>;
  queryBoundariesAt(year: number, scope: SpatialScope): Promise<BoundaryState[]>;
  queryEvents(range: YearRange, filters?: EventFilters): Promise<HistoricalEvent[]>;
  getCoverageDecision(polityId: string, year: number): Promise<CoverageDecision | undefined>;
  search(query: string, filters?: SearchFilters): Promise<SearchResult[]>;
}

interface OfflinePackageManager {
  listAvailable(): Promise<PackageMeta[]>;
  listInstalled(): Promise<InstalledPackage[]>;
  install(packageId: string, onProgress?: ProgressHandler): Promise<void>;
  activate(releaseId: string): Promise<void>;
  rollback(): Promise<void>;
  remove(packageId: string): Promise<void>;
}
```

`getHistoricalState`、地图绘制、时间轴、搜索、详情和关系图均依赖 `HistoricalSnapshot`，不再直接读取静态数据模块。

### 8.2 本地存储

- Service Worker 管理 app shell 与不可变发布文件的缓存策略。
- Cache Storage 存放不可变响应。
- IndexedDB 存放已安装包、release 清单、当前激活版本、下载进度和未提交反馈 outbox。
- 安装前检查存储配额，完成后校验每个文件哈希。
- 所有必需文件成功后才切换 `activeReleaseId`；更新失败时继续使用旧版。
- 至少保留上一个可用 release 用于回滚。
- 显式告知浏览器存储可能被回收；不将普通缓存宣称为永久下载。

### 8.3 更新策略

MVP 不实现行级 JSON Patch，而是比较新旧 manifest 文件哈希：

1. 下载新 manifest。
2. 根据依赖图列出缺失的内容哈希。
3. 仅下载新增或改变的文件。
4. 校验大小、MIME、SHA-256 和 schema。
5. 原子激活新 release。
6. 在新版稳定后回收未被任何已安装 release 引用的旧文件。

## 9. 实施分期

### 阶段0：发布前治理

- 确定 GitHub 套餐与托管拓扑。
- 完成地图公开展示合规路径，保持 `research-only` 为真实阻塞。
- 确定项目代码许可策略与 GPL-3.0 历史几何处理结论。
- 建立第三方许可清单与软件物料清单。
- 统一 Pages `base` 与所有运行时资源 URL。

### 阶段1：冻结数据契约

- 以 JSON Schema 作为单一运行时契约，生成 TypeScript 类型与验证器。
- 定义 entity、revision、source、evidence、territory decision 和 release manifest。
- 将 `leave-unfilled`、无公元0年、几何表达类型与发布合规 profile 写入 schema 与测试。

### 阶段2：发布器与统一运行时仓库

- 将现有 `src/data` 输入无语义改动地导出为确定性 release。
- 逐集合对账数量、ID、关联和哈希。
- 输出 core、中国疆域和世界世纪包。
- 将地图、时间轴、详情、搜索和知识覆盖改为同一 snapshot 的查询消费者。
- 保留 bundled snapshot 作为首个内置离线基线，不继续作为长期事实源。

### 阶段3：离线安装与回滚

- 安装 app shell、core 和 china-territory。
- 显示下载大小、进度、存储空间与许可说明。
- 断网重载完成地图、时间轴、搜索与详情的核心闭环。
- 支持新版本失败后继续使用旧版与人工回滚。

### 阶段4：编辑库与统一提案

- 建立 PostgreSQL/PostGIS 最小编辑表与对象存储层级。
- 导入现有内容、coverage decisions、territory research 和来源记录。
- 建立人工与自动化 proposal 入口，暂以 CLI 为主。
- 建立读者反馈 API、反滥用与审核队列。
- 发布器改从 `accepted` 修订产生相同发布契约，前端不再需调整。

### 阶段5：公开部署

- 建立最小权限 GitHub Pages 工作流。
- 配置经验证的自定义域名与 HTTPS，或验证项目子路径。
- 在默认域、自定义域、移动网络与离线条件下执行冒烟测试。
- 保留上一次成功 deployment 作为回滚目标。

## 10. 验收标准

### 发布安全

- private 源仓没有被改为 public。
- 构建产物不含 Source Map、原始 TypeScript、测试、密钥、内部附件和研究台账。
- PR 无权部署；默认分支在所有门禁通过后才能部署。
- 默认 GitHub 项目路径、自定义域与深链资源均可加载。

### 数据一致性

- 同一页面中地图、时间轴、详情、搜索与关系图显示同一 `releaseId`。
- 客户端可切换两个测试 release，更新失败不留下混合版本。
- 破损分片因哈希不符被拒绝，旧 release 继续可用。
- 数据导出前后的集合数量、稳定 ID、关联与关键历史状态通过对账。

### 离线能力

- 断网重载可使用 app shell、core 与 china-territory。
- 未安装的世界数据包显示可理解状态，不被当作历史事实缺失。
- 更新、中断、空间不足和哈希错误均能回到最后可用 release。

### 治理与历史边界

- 未审核的人工提案、自动化结果和读者反馈不进入读者包。
- `leave-unfilled` 年份不出现历史疆域面。
- 几何冲突保持扣留并进入人工审核，不自动合并或裁剪。
- 不允许再分发的资产不进入 `public-web` 或 `offline-public` 包。
- 公开部署时地图审核、来源署名、许可声明与有效期门禁全部通过。

## 11. 决策记录

1. 不因公开网页而将原始仓库改为 public。
2. 不使用前端直连编辑数据库。
3. 不以数据库迁移作为建立发布契约的前置条件。
4. 不用 public 发布仓作为编辑源。
5. 不让任何自动化或读者反馈直接进入稳定 release。
6. 不以填色率作为疆域研究的发布标准。
7. 不在 `research-only` 门禁失败时公开部署。
