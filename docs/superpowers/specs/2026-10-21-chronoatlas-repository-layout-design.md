# ChronoAtlas repository layout

## Goal

将地图应用从《资治通鉴》资料总目录中隔离出来，放入独立的本地目录 `chronoatlas/`，并让该目录对应 GitHub 仓库 `ziyingzhishang/chronoatlas`。

## Target layout

```text
资治通鉴/
├── chronoatlas/                 # 独立 Git 仓库：地图应用
│   ├── src/
│   ├── public/
│   ├── scripts/
│   ├── docs/
│   ├── package.json
│   ├── package-lock.json
│   └── .git/
├── demo/                        # 视频及人物内容资料
├── 文字静态图示范集/
└── 文字静态图示范集_v1.1暗色调/
```

## Migration rules

- 迁移地图应用当前所需的源码、静态数据、构建脚本、测试、文档和 Node 项目配置。
- 不迁移 `node_modules/`、`dist/`、`.DS_Store` 等本地生成物；在地图仓库中用 `.gitignore` 排除它们。
- 外层的图片示范集、视频 demo 及其他《资治通鉴》资料保持原位置不变。
- 在 `chronoatlas/` 初始化 Git，设置远程地址为 `https://github.com/ziyingzhishang/chronoatlas.git`。
- 迁移后从 `chronoatlas/` 执行依赖检查、测试和生产构建，确认路径和资源引用没有因目录变化而失效。
- 首次提交只包含地图项目内容，不把外层资料加入仓库。

## Acceptance criteria

1. `资治通鉴/chronoatlas/` 是可独立运行的地图项目。
2. `chronoatlas` 的 Git 状态只显示地图项目文件，外层资料不受 Git 管理。
3. `origin` 指向用户提供的 GitHub 仓库。
4. 地图项目的测试和生产构建通过。
5. 原目录中的 demo、图片示范集等资料仍可正常访问。
