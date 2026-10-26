# 山河年轮静态站点发布手册

## 当前状态

**当前不可公开部署。** 仓库已能构建并审计 GitHub Pages 静态产物，但 `public/data/map-release-compliance.json` 仍为 `research-only`，未记录有效审图号和有效期。`npm run verify:map-release` 必须失败，Pages 工作流也必须在上传产物前停止。

技术检查通过只说明站点能构建、路径和公开产物结构符合当前契约；不代表历史内容已全部完成校勘，也不代表地图、数据授权或公开展示已获得合规结论。

## 发布拓扑与仓库选择

首选保留当前私有源码仓库，由 `.github/workflows/pages.yml` 只上传 `dist` 中的公开产物。在开启前，仓库所有者必须核对当时 GitHub 套餐是否支持从 private 仓库提供 Pages；只有符合相应付费套餐与组织策略时才使用这一路径。

如果当时的 GitHub Free 或组织策略不允许 private Pages：

1. 优先选择支持连接 private 源仓的静态托管；或
2. 必须使用 GitHub Pages 时，建立一个独立的 public 产物仓库，只接收已审计的 `dist` 内容。

产物仓库不得包含 TypeScript 源码、测试、source map、`.env*`、Git 元数据、研究任务台账、内部审计记录或密钥。不得为了发布将源码仓库直接改为 public。

当前代码没有实现从 private 源仓到独立 public 产物仓的传输链路；这只是套餐不支持时的候选架构。采用前必须另行设计、审批并验证跨仓身份、最小权限、产物清理、完整性和回滚；不得把现有工作流直接当作跨仓发布方案。

## 停止条件

任一条成立时不得开启、手动重跑或绕过 Pages 部署：

- `npm run verify:map-release` 非零退出；
- 发布清单仍为 `research-only`，或审图号、有效期、必要的页面标识不完整；
- 审图号不属于本项目当次审核，或无法核验真实性、适用范围与有效期；
- 底图、几何、字典或其他第三方数据的来源、许可、署名或改作要求不明；
- `npm run verify:release-readiness` 或项目路径产物审计失败；
- 发布产物出现源码、内部台账、source map、凭证或未批准文件；
- 无法确认本次将部署的 commit 与已审核内容一致。

**禁止写入占位、借用无关项目或虚构的审图号、有效期和合规结论；也禁止删除、跳过或改弱 `verify:map-release` 门禁。**

## 发布前检查

在拥有者、内容/史学审核人、地图合规负责人和数据权利负责人都确认后，在拟发布 commit 上执行：

```bash
node --version # 必须为 v24.14.1
npm --version  # 必须为 11.14.1
npm ci
npm run verify:release-readiness
npm run verify:map-release
VITE_BASE_PATH=/chronoatlas/ npm run build
VITE_BASE_PATH=/chronoatlas/ npm run verify:pages-artifact -- dist
git status --short
```

检查项：

- `public/data/licenses/project-third-party-notices.json` 与当前依赖、数据来源一致；
- 页面内地图底图、Cliopatria、Historical Basemaps、Natural Earth 等必需署名可见；
- 来源链接、许可文件、审图号与有效期指向当次发布的真实记录；
- `git status --short` 没有未解释的生成物漂移；
- 上述命令全部通过。

## Pages 设置

仅在停止条件全部消除后：

1. 由仓库管理员在 GitHub 的 Pages 设置中选择 **GitHub Actions** 作为发布源。
2. 保留 `main` 分支保护，确保 `.github/workflows/quality.yml` 成为必需检查。
3. 为 `github-pages` environment 配置必要的审批人；不向 build job 增加写权限。
4. 合并到 `main` 会触发发布；`workflow_dispatch` 只由授权操作人在已确认 commit 上使用。
5. 确认工作流只上传 `dist`，部署 job 的权限仍只有 `contents: read`、`pages: write`、`id-token: write`。

## 项目路径验收

默认 GitHub Pages 项目站点基路径为 `/chronoatlas/`。部署后从工作流返回的 `page_url` 进入，并完成：

- 打开 `https://<owner>.github.io/chronoatlas/`，首页不得出现 404 或空白页；
- 确认 JS/CSS 从 `/chronoatlas/assets/` 加载，历史数据从 `/chronoatlas/data/` 加载，无根目录 `/assets/` 或 `/data/` 404；
- 切换年份、时间范围、底图与同期世界，打开事件、政权和地点详情；
- 检查地图右下角署名、资料来源链接、第三方声明与必需发布标识；
- 在桌面、平板和手机视口验证地图、时间控制器和详情阅读；
- 禁用缓存后再做一次首页和世界分片加载，避免本地旧资源掩盖路径问题。

## 自定义域验收

自定义域属于独立发布变更，不在本次实施范围。现有 `.github/workflows/pages.yml` 固定以 `/chronoatlas/` 构建和审计，**不能直接用于根路径自定义域**。获得 DNS 和仓库设置授权后，必须另行评审并将 Pages 工作流的 build/audit base 改为 `/`，同步修改工作流契约测试，然后用根 base 重新构建并审计：

```bash
VITE_BASE_PATH=/ npm run build
VITE_BASE_PATH=/ npm run verify:pages-artifact -- dist
```

配置 GitHub Pages 中的自定义域与 HTTPS 后，打开 `https://<your-domain>/`，重复项目路径的全部功能、署名和响应式验收，并确认资源从 `/assets/` 和 `/data/` 加载。不得直接把 `/chronoatlas/` 产物绑定到根域名。

## 回滚

1. 在 GitHub Actions 中找到最近一次已成功且仍然满足合规条件的 Pages 部署，记录对应 commit、产物和审批记录。
2. 优先使用 Pages 部署历史将站点回滚到该成功部署；若当时界面不支持，在 `main` 上通过正常审查的 revert commit 恢复，不强推、不重写历史。
3. 回滚版本也必须重新通过 `verify:release-readiness` 与 `verify:map-release`；过期审图信息不能因为“旧版曾成功”而继续使用。
4. 回滚后清除 CDN/浏览器缓存并重复两类 smoke checks；保留故障、回滚、最终验收记录。

## 权限边界

本手册不授权任何人开启 Pages、改变仓库可见性、修改 DNS、替换项目许可证或认定地图已合规。这些操作必须由相应所有者和审批人单独决定。
