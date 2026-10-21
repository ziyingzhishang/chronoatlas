# ChronoAtlas Repository Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前地图应用迁移到 `资治通鉴/chronoatlas/`，并建立与 GitHub `ziyingzhishang/chronoatlas` 对应的独立 Git 仓库。

**Architecture:** 保留外层《资治通鉴》资料目录作为内容资产目录；把地图应用的源码、数据、构建脚本、测试和文档整体放入 `chronoatlas/`，由该目录单独维护 Git。迁移使用文件系统移动，避免复制出两套地图代码。

**Tech Stack:** React, TypeScript, Vite, Vitest, npm, Git.

## Global Constraints

- 地图应用目录固定为 `资治通鉴/chronoatlas/`。
- 外层 `demo/`、`文字静态图示范集/` 和 `文字静态图示范集_v1.1暗色调/` 不迁入地图仓库。
- 不将 `node_modules/`、`dist/`、`.DS_Store` 等本地生成物纳入仓库。
- 远程地址为 `https://github.com/ziyingzhishang/chronoatlas.git`。
- 迁移完成后必须通过测试和生产构建。

### Task 1: 建立独立地图目录并迁移项目文件

**Files:**
- Create: `chronoatlas/`
- Move: `src/`、`public/`、`scripts/`、`docs/`、`index.html`、`package.json`、`package-lock.json`、`tsconfig*.json`、`vite.config.ts`、`README.md`
- Exclude: `node_modules/`、`dist/`、`.DS_Store`、图片示范集目录、视频 demo 目录

**Interfaces:**
- Produces: `chronoatlas/package.json` 可独立执行 `npm test`、`npm run build`。

- [ ] **Step 1:** 创建空目录 `chronoatlas/`。
- [ ] **Step 2:** 将上述地图项目文件和目录移动到 `chronoatlas/`，确认 `chronoatlas/src/app/App.tsx`、`chronoatlas/public/data/boundary-manifest.json`、`chronoatlas/package.json` 存在。
- [ ] **Step 3:** 创建 `chronoatlas/.gitignore`，内容为：

```gitignore
node_modules/
dist/
.DS_Store
*.log
```

- [ ] **Step 4:** 确认外层 `demo/`、`文字静态图示范集/` 和 `文字静态图示范集_v1.1暗色调/` 仍然存在。

### Task 2: 初始化 Git 并配置远程仓库

**Files:**
- Create: `chronoatlas/.git/`
- Modify: `chronoatlas/.git/config`

**Interfaces:**
- Produces: Git 根目录为 `chronoatlas/`，`origin` 指向用户提供的 GitHub URL。

- [ ] **Step 1:** 在 `chronoatlas/` 执行 `git init`。
- [ ] **Step 2:** 添加远程：`git remote add origin https://github.com/ziyingzhishang/chronoatlas.git`。
- [ ] **Step 3:** 执行 `git status --short` 和 `git remote -v`，确认只出现地图项目文件，远程地址正确。
- [ ] **Step 4:** 执行 `git add . && git commit -m "chore: establish chronoatlas map repository"`。

### Task 3: 在新根目录重新安装并验证

**Files:**
- Modify: `chronoatlas/node_modules/`（忽略目录）
- Modify: `chronoatlas/dist/`（忽略目录）

**Interfaces:**
- Consumes: `chronoatlas/package-lock.json`。
- Produces: 新仓库根目录下通过的测试和生产构建。

- [ ] **Step 1:** 在 `chronoatlas/` 执行 `npm ci`。
- [ ] **Step 2:** 执行 `npm test -- --run`，确认 Vitest 通过。
- [ ] **Step 3:** 执行 `npm run build`，确认 TypeScript 和 Vite 构建通过。
- [ ] **Step 4:** 执行 `git status --short`，确认没有未提交的跟踪文件变化。

### Task 4: 将批准的设计和计划纳入地图仓库

**Files:**
- Move: `docs/superpowers/specs/2026-10-21-chronoatlas-repository-layout-design.md` 到 `chronoatlas/docs/superpowers/specs/2026-10-21-chronoatlas-repository-layout-design.md`
- Move: `docs/superpowers/plans/2026-10-21-chronoatlas-repository-layout.md` 到 `chronoatlas/docs/superpowers/plans/2026-10-21-chronoatlas-repository-layout.md`

**Interfaces:**
- Produces: 仓库内留有已批准的结构说明和实施计划。

- [ ] **Step 1:** 移动两个文档，确认目标文件存在后删除外层副本。
- [ ] **Step 2:** 在 `chronoatlas/` 执行 `git add docs/superpowers && git commit -m "docs: record chronoatlas repository layout"`。
- [ ] **Step 3:** 执行 `git log --oneline -2`、`git status --short --branch` 和 `git remote -v`，确认提交、工作区和远程状态。
