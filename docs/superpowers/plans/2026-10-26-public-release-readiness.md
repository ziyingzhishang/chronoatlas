# Public Release Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the private ChronoAtlas repository technically ready for a gated static deployment without publishing while the real map-release compliance check remains blocked.

**Architecture:** Keep the source repository private, make every runtime asset URL base-aware, generate auditable third-party notices, and add least-privilege CI that builds and audits a Pages artifact. The deploy job may exist, but `npm run verify:map-release` remains a hard prerequisite, so the current `research-only` release cannot become public.

**Tech Stack:** Vite 6, React 18, TypeScript 5.7, Node.js scripts, Vitest, GitHub Actions, GitHub Pages artifact deployment.

## Global Constraints

- Never change the repository visibility as part of this plan.
- Never insert a placeholder review number or bypass `npm run verify:map-release`.
- Production artifacts must not contain source maps, TypeScript sources, tests, `.env` files, Git metadata, internal research ledgers, or secrets.
- All browser-side values and files are public; no secret may use a `VITE_*` variable.
- Project-path deployment at `/chronoatlas/` and root/custom-domain deployment must both work.
- Pull requests run checks only and never deploy.
- The deploy job uses only `contents: read`, `pages: write`, and `id-token: write` as required by its steps.
- Existing source and data license obligations must be preserved; a passing build is not a legal conclusion.
- CI and documented local release builds use Node `24.14.1` and npm `11.14.1` until a separately reviewed runtime upgrade.

---

## Planned File Structure

- `src/runtime/asset-url.ts`: one base-aware URL resolver for public runtime assets.
- `src/runtime/asset-url.test.ts`: root and project-path URL behavior.
- `scripts/build-third-party-notices.mjs`: deterministic public notice generator.
- `scripts/verify-pages-artifact.mjs`: post-build artifact deny-list and path audit.
- `scripts/verify-pages-artifact.test.mjs`: fixture-based Node tests for the artifact audit.
- `public/data/licenses/project-third-party-notices.json`: generated application/data notice index.
- `.github/workflows/quality.yml`: PR and main validation without deployment.
- `.github/workflows/pages.yml`: gated default-branch build and Pages deployment.
- `vite.config.ts`: explicit environment-controlled base and disabled production source maps.
- `package.json`: notice and artifact verification commands.
- `src/data/world.ts`, `src/components/MapView.tsx`, and other `/data/` consumers: use the shared resolver.

### Task 1: Establish a base-aware public asset contract

**Files:**
- Create: `src/runtime/asset-url.ts`
- Create: `src/runtime/asset-url.test.ts`
- Modify: `vite.config.ts`
- Modify: `src/vite-env.d.ts`
- Create: `.node-version`
- Modify: `package.json`

**Interfaces:**
- Produces: `publicAssetUrl(path: string, baseUrl?: string): string`
- Invariant: a caller passes `data/world/-200.json`, not a leading-slash URL.

- [ ] **Step 1: Write failing URL tests**

```ts
import { describe, expect, test } from 'vitest';
import { publicAssetUrl } from './asset-url';

describe('publicAssetUrl', () => {
  test('resolves under a project Pages base', () => {
    expect(publicAssetUrl('data/world/-200.json', '/chronoatlas/'))
      .toBe('/chronoatlas/data/world/-200.json');
  });

  test('resolves under a root or custom domain', () => {
    expect(publicAssetUrl('data/world/-200.json', '/'))
      .toBe('/data/world/-200.json');
  });

  test('rejects absolute, traversal and protocol paths', () => {
    expect(() => publicAssetUrl('/data/world/0.json', '/chronoatlas/')).toThrow();
    expect(() => publicAssetUrl('../secret', '/chronoatlas/')).toThrow();
    expect(() => publicAssetUrl('https://example.com/data.json', '/')).toThrow();
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the red state**

Run: `npx vitest --run src/runtime/asset-url.test.ts`  
Expected: FAIL because `asset-url.ts` does not exist.

- [ ] **Step 3: Implement the URL resolver**

```ts
export function publicAssetUrl(path: string, baseUrl = import.meta.env.BASE_URL): string {
  if (!path || path.startsWith('/') || path.includes('..') || /^[a-z][a-z\d+.-]*:/i.test(path)) {
    throw new Error(`Public asset path must be a safe relative path: ${path}`);
  }
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${path}`.replace(/\/{2,}/g, '/');
}
```

Set Vite `base` from a non-secret build variable with `/` as the local/custom-domain default and keep `build.sourcemap: false` explicit. Write `24.14.1` to `.node-version`, add matching `engines.node` and `packageManager: "npm@11.14.1"` metadata to `package.json`.

- [ ] **Step 4: Run focused tests and both base builds**

Run:

```bash
npx vitest --run src/runtime/asset-url.test.ts
npm run build
VITE_BASE_PATH=/chronoatlas/ npm run build
```

Expected: tests PASS; both builds complete; project build HTML references `/chronoatlas/assets/...`.

- [ ] **Step 5: Commit**

```bash
git add src/runtime/asset-url.ts src/runtime/asset-url.test.ts src/vite-env.d.ts vite.config.ts .node-version package.json
git commit -m "feat: add base-aware public asset paths"
```

### Task 2: Remove root-relative runtime data paths

**Files:**
- Modify: `src/data/world.ts`
- Modify: `src/components/MapView.tsx`
- Modify: every non-test source returned by `rg -n "['\"]\/data\/" src`
- Test: existing component and data tests plus targeted new assertions near each changed consumer

**Interfaces:**
- Consumes: `publicAssetUrl(path: string): string`
- Produces: no root-relative `/data/...` references in runtime TypeScript/TSX.

- [ ] **Step 1: Add failing consumer assertions**

In `src/data/world.test.ts`, mock `publicAssetUrl` to return the project-base path, mock `fetch`, invoke `loadWorldSlice(-200)`, and assert:

```ts
expect(fetch).toHaveBeenCalledWith(
  '/chronoatlas/data/world/-200.json',
  expect.any(Object),
);
```

For `MapView`, assert manifest links are produced through the configured base rather than literal root paths.

- [ ] **Step 2: Run the focused tests and verify the old literals fail**

Run: `npx vitest --run src/data/world.test.ts src/components/MapView.test.tsx`  
Expected: FAIL on project-base expectations.

- [ ] **Step 3: Replace every runtime literal with `publicAssetUrl`**

Example:

```ts
const response = await fetch(publicAssetUrl(`data/world/${start}.json`), { signal: controller.signal });
```

JSX links use the same resolver:

```tsx
<a href={publicAssetUrl('data/cliopatria-manifest.json')} target="_blank" rel="noreferrer">
  {t('版本清单')}
</a>
```

- [ ] **Step 4: Prove no runtime root path remains**

Run:

```bash
npx vitest --run src/data/world.test.ts src/components/MapView.test.tsx
rg -n "['\"]\/data\/" src --glob '!**/*.test.*'
```

Expected: focused tests PASS; `rg` returns no runtime matches.

- [ ] **Step 5: Commit**

```bash
git add src/data/world.ts src/components/MapView.tsx src/data/world.test.ts src/components/MapView.test.tsx
git commit -m "fix: resolve runtime data beneath the site base"
```

### Task 3: Generate a deterministic public notice index

**Files:**
- Create: `scripts/build-third-party-notices.mjs`
- Create: `scripts/build-third-party-notices.test.mjs`
- Create: `config/third-party-data.json`
- Generate: `public/data/licenses/project-third-party-notices.json`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run build:notices`
- Produces JSON shape: `{ generatedFrom, software[], data[] }`; entries contain `name`, `version`, `license`, `source`, `attribution`, and `changes` where applicable.

- [ ] **Step 1: Write fixture tests for ordering and required fields**

Use `node:test` with a temporary output directory. Assert that missing `license`, `source`, or required attribution throws and that entries are sorted by name.

```js
assert.deepEqual(result.data.map(entry => entry.name), ['Cliopatria', 'Historical Basemaps']);
assert.throws(() => validateEntry({ name: 'Broken source' }), /license/);
```

- [ ] **Step 2: Run the Node test and verify failure**

Run: `node --test scripts/build-third-party-notices.test.mjs`  
Expected: FAIL because the generator does not exist.

- [ ] **Step 3: Implement the generator without adding a dependency**

Read declared application dependencies from `package-lock.json`, combine them with reviewed data entries from `config/third-party-data.json`, validate required fields, sort deterministically, and write formatted JSON with a terminal newline. Do not scan or expose internal source notes.

- [ ] **Step 4: Generate and verify notices**

Run:

```bash
node --test scripts/build-third-party-notices.test.mjs
npm run build:notices
git diff --check
```

Expected: tests PASS; the generated file contains the reviewed data attributions and package license metadata.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-third-party-notices.mjs scripts/build-third-party-notices.test.mjs config/third-party-data.json public/data/licenses/project-third-party-notices.json package.json
git commit -m "build: generate public third-party notices"
```

### Task 4: Audit the final Pages artifact

**Files:**
- Create: `scripts/verify-pages-artifact.mjs`
- Create: `scripts/verify-pages-artifact.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run verify:pages-artifact -- dist`
- Rejects extensions/names: `.map`, `.ts`, `.tsx`, `.env*`, `.git*`, test/spec files, internal audit ledgers, and unexpected files outside an allow-listed artifact layout.
- Rejects HTML or JavaScript containing `sourceMappingURL`, root-relative `/assets/` or `/data/` when built for `/chronoatlas/`, and common private-key/token signatures.

- [ ] **Step 1: Write red tests with safe and unsafe fixture trees**

```js
await assert.rejects(() => verifyArtifact(mapFixture), /source map/i);
await assert.rejects(() => verifyArtifact(rootPathFixture, { base: '/chronoatlas/' }), /root-relative/i);
await assert.doesNotReject(() => verifyArtifact(validFixture, { base: '/chronoatlas/' }));
```

- [ ] **Step 2: Run tests and confirm the missing verifier failure**

Run: `node --test scripts/verify-pages-artifact.test.mjs`  
Expected: FAIL because the verifier does not exist.

- [ ] **Step 3: Implement deterministic recursive auditing**

Use `node:fs/promises` and `node:path`; never follow symbolic links. Report every violation in one run and exit non-zero if any exists. Accept the artifact directory as the first positional argument and `VITE_BASE_PATH` as the expected base.

- [ ] **Step 4: Audit root and project-path builds**

Run:

```bash
node --test scripts/verify-pages-artifact.test.mjs
npm run build
npm run verify:pages-artifact -- dist
VITE_BASE_PATH=/chronoatlas/ npm run build
VITE_BASE_PATH=/chronoatlas/ npm run verify:pages-artifact -- dist
```

Expected: all tests and both artifact audits PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-pages-artifact.mjs scripts/verify-pages-artifact.test.mjs package.json
git commit -m "build: reject unsafe Pages artifacts"
```

### Task 5: Add non-deploying repository quality CI

**Files:**
- Create: `.github/workflows/quality.yml`
- Modify: `package.json`

**Interfaces:**
- Produces a PR/main workflow with read-only contents permission.
- Runs knowledge coverage, tests excluding `.worktrees`, the normal build, notice generation consistency, artifact audit, and `git diff --check`.
- Produces: `npm run verify:release-readiness`, containing the shared local/CI command sequence without deployment.

- [ ] **Step 1: Add a workflow contract test**

Create `scripts/workflow-contract.test.mjs` that reads YAML as text and asserts the quality workflow contains:

```js
assert.match(source, /pull_request:/);
assert.match(source, /contents:\s*read/);
assert.doesNotMatch(source, /pages:\s*write/);
assert.doesNotMatch(source, /deploy-pages/);
```

- [ ] **Step 2: Run the contract test and verify failure**

Run: `node --test scripts/workflow-contract.test.mjs`  
Expected: FAIL because `quality.yml` does not exist.

- [ ] **Step 3: Implement the least-privilege quality workflow**

Use Node `24.14.1`, npm `11.14.1`, `npm ci`, and run:

```bash
npm run build:knowledge-coverage
npx vitest --run --exclude '.worktrees/**'
npm run build:notices
npm run build
npm run verify:pages-artifact -- dist
git diff --check
```

Do not add deployment permissions or a deploy step.

Resolve `actions/checkout@v6` and `actions/setup-node@v6` with `git ls-remote` and pin their peeled full commit SHAs in the workflow. Record the readable tag beside each SHA and extend the contract test to reject `uses: ...@v[0-9]` references.

- [ ] **Step 4: Run the workflow contract and local command sequence**

Expected: contract PASS; all local commands PASS; generated notices leave no unexplained diff.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/quality.yml scripts/workflow-contract.test.mjs package.json
git commit -m "ci: validate release readiness without deploying"
```

### Task 6: Add the compliance-gated Pages workflow

**Files:**
- Create: `.github/workflows/pages.yml`
- Modify: `scripts/workflow-contract.test.mjs`

**Interfaces:**
- Deploys only from the default branch or a manually authorized workflow run.
- Build job: `contents: read` only.
- Deploy job: `contents: read`, `pages: write`, `id-token: write` and `github-pages` environment.
- Hard prerequisite: `npm run verify:map-release` before artifact upload.

- [ ] **Step 1: Extend workflow contract tests**

Assert:

```js
assert.match(pages, /verify:map-release/);
assert.match(pages, /upload-pages-artifact/);
assert.match(pages, /deploy-pages/);
assert.match(pages, /pages:\s*write/);
assert.match(pages, /id-token:\s*write/);
assert.doesNotMatch(pages, /pull_request_target/);
```

Also assert that artifact upload text occurs after `verify:map-release`.

- [ ] **Step 2: Run the contract and verify failure**

Run: `node --test scripts/workflow-contract.test.mjs`  
Expected: FAIL because `pages.yml` does not exist.

- [ ] **Step 3: Implement the workflow**

The build job runs the same checks as quality CI plus:

```bash
npm run verify:map-release
VITE_BASE_PATH=/chronoatlas/ npm run build
VITE_BASE_PATH=/chronoatlas/ npm run verify:pages-artifact -- dist
```

Then upload only `dist`. The deploy job consumes the Pages artifact and uses the `github-pages` environment.

Resolve every official action tag to a full commit before writing the workflow:

```bash
git ls-remote https://github.com/actions/checkout.git 'refs/tags/v6*'
git ls-remote https://github.com/actions/configure-pages.git 'refs/tags/v5*'
git ls-remote https://github.com/actions/upload-pages-artifact.git 'refs/tags/v4*'
git ls-remote https://github.com/actions/deploy-pages.git 'refs/tags/v4*'
git ls-remote https://github.com/actions/setup-node.git 'refs/tags/v6*'
```

Use the peeled commit for annotated tags, record the human-readable tag in a YAML comment, and extend the workflow contract test to reject action references matching `uses: ...@v[0-9]`. This avoids placing a stale or invented SHA in the plan while making SHA pinning mechanically mandatory.

- [ ] **Step 4: Verify the workflow is safely blocked today**

Run:

```bash
node --test scripts/workflow-contract.test.mjs
npm run verify:map-release
```

Expected: contract PASS; the map-release command exits non-zero with `research-only`, missing review number, and missing expiry. Do not weaken this expected failure.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/pages.yml scripts/workflow-contract.test.mjs
git commit -m "ci: gate Pages deployment on public map approval"
```

### Task 7: Final release-readiness verification and operator documentation

**Files:**
- Create: `docs/release/public-static-site-runbook.md`
- Modify: `README.md`

**Interfaces:**
- Documents the exact blocking status, GitHub plan branch, Pages settings, custom-domain setup, rollback, and smoke checks.

- [ ] **Step 1: Write the runbook with explicit stop conditions**

Include:

- private Pages for eligible paid plans;
- public artifact repository only as the GitHub Free fallback;
- current `research-only` state;
- prohibition on fake review metadata;
- custom-domain and `/chronoatlas/` smoke URLs;
- rollback to the last successful Pages deployment;
- license and attribution checks.

- [ ] **Step 2: Run the complete technical validation**

```bash
npm run build:knowledge-coverage
npx vitest --run --exclude '.worktrees/**'
node --test scripts/build-third-party-notices.test.mjs scripts/verify-pages-artifact.test.mjs scripts/workflow-contract.test.mjs
npm run build:notices
VITE_BASE_PATH=/chronoatlas/ npm run build
VITE_BASE_PATH=/chronoatlas/ npm run verify:pages-artifact -- dist
git diff --check
```

Expected: all technical checks PASS.

- [ ] **Step 3: Reconfirm the external release blocker**

Run: `npm run verify:map-release`  
Expected until real approval exists: FAIL with the recorded public-map blockers. Record this as “not deployable”, not as a test defect.

- [ ] **Step 4: Commit**

```bash
git add docs/release/public-static-site-runbook.md README.md
git commit -m "docs: add public static release runbook"
```

## Completion Boundary

This plan is complete when the repository can produce and audit a correct project-path Pages artifact and the deployment workflow is demonstrably blocked by real compliance state. It does **not** authorize enabling Pages, changing repository visibility, changing DNS, changing the project license, or claiming public-release readiness; each requires the corresponding owner/legal/compliance decision.
