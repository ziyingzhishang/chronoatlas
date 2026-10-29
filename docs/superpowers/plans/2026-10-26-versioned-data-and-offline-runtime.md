# Versioned Data and Offline Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace compile-time historical-content coupling with one immutable release snapshot and add installable, hash-verified offline packages for the application shell, core Chinese content, and China territory data.

**Architecture:** Existing TypeScript/JSON catalogs remain the temporary authoring input, but a deterministic release builder exports versioned packages and a root manifest. Every map, timeline, search, detail, and relationship consumer reads one `HistoricalSnapshot`; a package manager stores immutable responses in Cache Storage, tracks installed releases in IndexedDB, and activates a release only after all hashes pass.

**Tech Stack:** TypeScript, React Context, JSON Schema, Ajv, json-schema-to-ts, Vite/Node build scripts, Web Crypto SHA-256, Cache Storage, IndexedDB, Service Worker, Vitest/jsdom.

## Global Constraints

- No public/editorial database or feedback API is implemented in this plan.
- No runtime consumer may mix data from different `releaseId` values.
- `leave-unfilled` is a valid published conclusion and must never trigger nearest-year or maximum-outline fallback.
- Historical years are non-zero civil-year integers.
- Research tasks, raw feedback, restricted attachments, and internal review notes never enter reader packages.
- ArcGIS terrain/satellite tiles are not part of the offline promise.
- MVP updates compare content hashes; no row-level JSON Patch or binary delta.
- A failed install or update leaves the previously active release usable.
- Do not migrate all authoring data to PostgreSQL/PostGIS in this plan; preserve interfaces that allow a future exporter to replace the current source adapter.

---

## Planned File Structure

- `src/content/release-types.ts`: release/package/file contracts.
- `src/content/release-schema.json`: single runtime JSON Schema.
- `src/content/release-validation.ts`: generated or schema-derived runtime validation facade.
- `src/content/snapshot.ts`: `HistoricalSnapshot` query interface.
- `src/content/repository.ts`: repository opening a named release.
- `src/content/bundled-adapter.ts`: temporary adapter from existing catalogs to snapshot input.
- `scripts/build-content-release.mjs`: deterministic package exporter.
- `scripts/verify-content-release.mjs`: standalone package/reference/license/hash verifier.
- `public/releases/latest.json`: mutable release pointer.
- `public/releases/<releaseId>/manifest.json`: immutable root manifest.
- `src/offline/package-store.ts`: storage abstraction.
- `src/offline/indexeddb-package-store.ts`: browser metadata and activation state.
- `src/offline/cache-package-files.ts`: immutable file cache.
- `src/offline/offline-package-manager.ts`: install/activate/rollback orchestration.
- `public/sw.js`: app-shell and immutable release fetch behavior.
- `src/offline/register-service-worker.ts`: registration boundary.
- `src/components/OfflineDataManager.tsx`: package size/status/install/remove UI.

### Task 1: Define one release contract

**Files:**
- Create: `src/content/release-types.ts`
- Create: `src/content/release-schema.json`
- Create: `src/content/release-validation.ts`
- Create: `src/content/release-validation.test.ts`
- Modify: `src/content/repository.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `ReleaseManifest`, `ReleasePackage`, `ReleaseFile`, `ComplianceProfile`.
- Produces: `validateReleaseManifest(value: unknown): ReleaseManifest`.

- [ ] **Step 1: Write failing validation tests**

Cover a valid manifest and rejection of year zero, duplicate package IDs, unsafe URIs, malformed SHA-256, absent license IDs, missing dependencies, and an invalid compliance profile.

```ts
expect(() => validateReleaseManifest({ ...valid, releaseId: '' })).toThrow(/releaseId/);
expect(() => validateReleaseManifest(withYearRange(valid, [-1, 0]))).toThrow(/year 0/i);
expect(() => validateReleaseManifest(withFile(valid, { sha256: 'bad' }))).toThrow(/sha256/i);
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npx vitest --run src/content/release-validation.test.ts`  
Expected: FAIL because the release contract does not exist.

- [ ] **Step 3: Install the schema runtime and type bridge**

Run:

```bash
npm install ajv
npm install --save-dev json-schema-to-ts
```

`release-schema.json` remains the authoritative contract. `release-types.ts` imports the JSON schema and derives the public TypeScript type with `FromSchema`; do not maintain a second hand-written interface with the same fields.

- [ ] **Step 4: Implement exact release types and schema validation**

Define:

```ts
export type ComplianceProfile = 'internal-research' | 'public-web' | 'offline-public';

import type { FromSchema } from 'json-schema-to-ts';
import schema from './release-schema.json';

export type ReleaseManifest = FromSchema<typeof schema>;
```

Compile the same schema with Ajv. `release-validation.ts` exposes a stable validation API and checks cross-record conditions that JSON Schema alone cannot express.

- [ ] **Step 5: Run focused tests**

Run: `npx vitest --run src/content/release-validation.test.ts src/content/repository.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/release-types.ts src/content/release-schema.json src/content/release-validation.ts src/content/release-validation.test.ts src/content/repository.ts package.json package-lock.json
git commit -m "feat: define versioned historical data releases"
```

### Task 2: Build deterministic packages from current authoring data

**Files:**
- Create: `scripts/build-content-release.mjs`
- Create: `scripts/build-content-release.test.mjs`
- Create: `scripts/verify-content-release.mjs`
- Create: `scripts/verify-content-release.test.mjs`
- Create: `src/content/bundled-adapter.ts`
- Modify: `src/content/bundled-content.ts`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `npm run build:content-release -- --release <id> --profile internal-research`.
- Produces packages: `core-zh`, `china-territory`, and existing `world-*` references.
- Produces immutable files with deterministic ordering, SHA-256, byte size, record count, and license IDs.

- [ ] **Step 1: Write deterministic exporter tests**

Using a small fixture, run the exporter twice into different temporary directories and assert identical manifests and content hashes. Assert research tasks and internal notes are absent.

```js
assert.deepEqual(first.manifest.packages, second.manifest.packages);
assert.equal(findText(first.output, 'territory-research:'), false);
```

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test scripts/build-content-release.test.mjs scripts/verify-content-release.test.mjs`  
Expected: FAIL because the scripts do not exist.

- [ ] **Step 3: Implement the temporary authoring adapter and exporter**

The adapter collects the existing public catalogs in one place. The exporter sorts collections by stable identity, serializes with a terminal newline, hashes the final bytes, and writes to a temporary directory before renaming the complete release directory. It must not copy `territoryResearchTasks`, raw coverage audit output, or internal reader-forbidden fields.

- [ ] **Step 4: Implement the independent verifier**

The verifier reloads files from disk and checks schema, path safety, file bytes, SHA-256, collection record count, package dependencies, source/license references, and `leave-unfilled` geometry absence.

- [ ] **Step 5: Run exporter, verifier, and existing data checks**

```bash
node --test scripts/build-content-release.test.mjs scripts/verify-content-release.test.mjs
npm run build:content-release -- --release fixture-current --profile internal-research
npm run verify:content-release -- public/releases/fixture-current/manifest.json
npm run build:knowledge-coverage
```

Expected: PASS; output is deterministic and uses `internal-research` until real publication approval.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-content-release.mjs scripts/build-content-release.test.mjs scripts/verify-content-release.mjs scripts/verify-content-release.test.mjs src/content/bundled-adapter.ts src/content/bundled-content.ts package.json .gitignore
git commit -m "build: export immutable historical data packages"
```

### Task 3: Open one immutable historical snapshot

**Files:**
- Create: `src/content/snapshot.ts`
- Create: `src/content/snapshot.test.ts`
- Modify: `src/content/repository.ts`
- Modify: `src/content/repository.test.ts`
- Modify: `src/content/ContentContext.tsx`
- Modify: `src/content/ContentContext.test.tsx`

**Interfaces:**
- Produces: `HistoricalDataRepository.open(releaseId?: string): Promise<HistoricalSnapshot>`.
- Produces snapshot queries: `getEntity`, `queryPolitiesAt`, `queryBoundariesAt`, `queryEvents`, `getCoverageDecision`, and `search`.

- [ ] **Step 1: Write red snapshot tests**

Assert one release is fixed for the lifetime of the snapshot, queries do not refetch the mutable `latest.json`, unsupported schema fails closed, and collection load failure never returns a partial snapshot.

```ts
const snapshot = await repository.open('release-a');
expect(snapshot.release.releaseId).toBe('release-a');
await expect(snapshot.queryPolitiesAt(0)).rejects.toThrow(/year 0/i);
```

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npx vitest --run src/content/snapshot.test.ts src/content/repository.test.ts src/content/ContentContext.test.tsx`  
Expected: FAIL on the missing snapshot API.

- [ ] **Step 3: Implement lazy package loading behind a fixed snapshot**

`open()` fetches and validates one manifest. Query methods load only required packages/collections, memoize immutable responses, and return domain values without exposing raw manifest records to components. Remove the external-catalog `as unknown as BundledContentCatalog` cast.

- [ ] **Step 4: Update `ContentProvider` to expose loading, error, release, and snapshot**

Provider state is:

```ts
type ContentState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; snapshot: HistoricalSnapshot; release: ReleaseManifest };
```

It must fail closed rather than combine bundled and external records after an error.

- [ ] **Step 5: Run focused tests**

Expected: all content tests PASS; no unsafe catalog cast remains.

- [ ] **Step 6: Commit**

```bash
git add src/content/snapshot.ts src/content/snapshot.test.ts src/content/repository.ts src/content/repository.test.ts src/content/ContentContext.tsx src/content/ContentContext.test.tsx
git commit -m "refactor: open historical data through fixed snapshots"
```

### Task 4: Move map state and map presentation to the snapshot

**Files:**
- Modify: `src/domain/history-state.ts`
- Modify: `src/domain/history-state.test.ts`
- Modify: `src/map/history-map.ts`
- Modify: `src/map/history-map.test.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/app/integration.test.tsx`

**Interfaces:**
- Consumes: `HistoricalSnapshot` query methods.
- Produces: `getHistoricalState(snapshot, year, options)` with no direct data-module imports.

- [ ] **Step 1: Add tests proving injected release data controls the map**

Create two in-memory snapshots with different polity/boundary results for the same year. Assert switching the snapshot changes the rendered historical state and never reads the compile-time catalog.

- [ ] **Step 2: Run tests and confirm current direct imports fail the isolation assertion**

Run: `npx vitest --run src/domain/history-state.test.ts src/map/history-map.test.ts src/app/integration.test.tsx`.

- [ ] **Step 3: Refactor history state to explicit dependencies**

Remove direct imports of boundaries, events, places, polities, and capital history. Preserve the rule that only explicit accepted decisions create runtime geometry and `leave-unfilled` produces none.

- [ ] **Step 4: Refactor map presentation dependencies**

Supply places, capital terms, sovereignty reference, and geometry through the snapshot or an explicitly injected immutable map reference. Do not add hidden fallback to the old static modules.

- [ ] **Step 5: Run focused tests and commit**

```bash
npx vitest --run src/domain/history-state.test.ts src/map/history-map.test.ts src/app/integration.test.tsx
git add src/domain/history-state.ts src/domain/history-state.test.ts src/map/history-map.ts src/map/history-map.test.ts src/app/App.tsx src/app/integration.test.tsx
git commit -m "refactor: render the map from one data snapshot"
```

### Task 5: Move timeline, search, details, and relationships to the snapshot

**Files:**
- Modify: `src/components/Timeline.tsx`
- Modify: `src/components/EventExplorer.tsx`
- Modify: `src/components/InfoPanel.tsx`
- Modify: `src/components/KnowledgeCoveragePanel.tsx`
- Modify: `src/components/RelationshipGraph.tsx`
- Modify: relevant focused tests for each component
- Create: `src/content/runtime-import-boundary.test.ts`

**Interfaces:**
- Consumes: `HistoricalSnapshot` or reader-specific view models built from it.
- Produces: no non-test UI/domain/map direct imports from `src/data/*`, except explicitly documented static presentation constants that are not historical content.

- [ ] **Step 1: Add a failing import-boundary test**

Scan non-test files and reject direct historical-data imports outside `src/content/bundled-adapter.ts`, data build scripts, and narrowly allow-listed non-content constants.

```ts
expect(violations).toEqual([]);
```

- [ ] **Step 2: Run the test and record current violations**

Run: `npx vitest --run src/content/runtime-import-boundary.test.ts`  
Expected: FAIL with Timeline, EventExplorer, history/map/detail and coverage imports.

- [ ] **Step 3: Migrate one consumer family at a time**

Order:

1. Timeline periods, events, and boundary-change years.
2. Event search and event detail.
3. Polity/person/city/heritage detail view models.
4. Relationship graph.
5. Knowledge coverage reader output.

After each family, run its focused tests. Do not let reader components render raw IDs or internal review fields as a fallback.

- [ ] **Step 4: Run all component and boundary tests**

```bash
npx vitest --run src/components src/content/runtime-import-boundary.test.ts
```

Expected: PASS; import-boundary violations are empty.

- [ ] **Step 5: Commit**

```bash
git add src/components src/content/runtime-import-boundary.test.ts
git commit -m "refactor: serve reader experiences from the active release"
```

### Task 6: Implement transactional offline package storage

**Files:**
- Create: `src/offline/package-store.ts`
- Create: `src/offline/memory-package-store.ts`
- Create: `src/offline/offline-package-manager.ts`
- Create: `src/offline/offline-package-manager.test.ts`
- Create: `src/offline/hash.ts`
- Create: `src/offline/hash.test.ts`

**Interfaces:**
- Produces: `OfflinePackageManager.listAvailable`, `listInstalled`, `install`, `activate`, `rollback`, `remove`.
- Produces store transactions for staging, completion, activation, and deletion.

- [ ] **Step 1: Write failure-first package lifecycle tests**

Cover successful install, hash mismatch, interrupted download, dependency failure, insufficient space, atomic activation, rollback, and refusal to remove an active dependency.

```ts
await expect(manager.install('core-zh')).rejects.toThrow(/sha256/i);
expect(await store.activeReleaseId()).toBe('release-old');
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest --run src/offline/hash.test.ts src/offline/offline-package-manager.test.ts`.

- [ ] **Step 3: Implement SHA-256 and storage-independent orchestration**

Use Web Crypto. Download into a staging namespace, verify size and hash, mark a package complete only after every file succeeds, and activate a release in one metadata transaction. Keep the old release active on any error.

- [ ] **Step 4: Run lifecycle tests**

Expected: PASS for all success, interruption, corruption, and rollback scenarios.

- [ ] **Step 5: Commit**

```bash
git add src/offline/package-store.ts src/offline/memory-package-store.ts src/offline/offline-package-manager.ts src/offline/offline-package-manager.test.ts src/offline/hash.ts src/offline/hash.test.ts
git commit -m "feat: add transactional offline package installs"
```

### Task 7: Add browser Cache Storage and IndexedDB adapters

**Files:**
- Create: `src/offline/cache-package-files.ts`
- Create: `src/offline/cache-package-files.test.ts`
- Create: `src/offline/indexeddb-package-store.ts`
- Create: `src/offline/indexeddb-package-store.test.ts`
- Create: `src/test/fake-indexeddb.ts` only if the existing test environment lacks the required API; do not add a production dependency for tests.

**Interfaces:**
- Implements the `PackageStore` contract from Task 6.
- Cache key includes `releaseId`, `packageId`, and immutable file URI.
- IndexedDB stores installed metadata, active release, previous release, and incomplete staging sessions.

- [ ] **Step 1: Write adapter contract tests**

Run the same contract against memory and browser adapters. Assert that reopening the IndexedDB adapter preserves activation state and that cleanup removes abandoned staging records without touching active files.

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest --run src/offline/cache-package-files.test.ts src/offline/indexeddb-package-store.test.ts`.

- [ ] **Step 3: Implement adapters**

Never store mutable `latest.json` as an immutable package file. Cache only validated release URLs. Keep metadata schema versioned and fail closed on an unsupported database version.

- [ ] **Step 4: Run contract tests and commit**

```bash
npx vitest --run src/offline/cache-package-files.test.ts src/offline/indexeddb-package-store.test.ts src/offline/offline-package-manager.test.ts
git add src/offline/cache-package-files.ts src/offline/cache-package-files.test.ts src/offline/indexeddb-package-store.ts src/offline/indexeddb-package-store.test.ts src/test/fake-indexeddb.ts
git commit -m "feat: persist offline releases in browser storage"
```

### Task 8: Add the app-shell service worker and offline management UI

**Files:**
- Create: `public/sw.js`
- Create: `scripts/inject-service-worker-manifest.mjs`
- Create: `scripts/inject-service-worker-manifest.test.mjs`
- Create: `src/offline/register-service-worker.ts`
- Create: `src/offline/register-service-worker.test.ts`
- Create: `src/components/OfflineDataManager.tsx`
- Create: `src/components/OfflineDataManager.test.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/i18n/text.ts`
- Modify: `package.json`

**Interfaces:**
- Registers service worker only in production and secure contexts.
- UI displays package name, release, size, license summary, state, progress, install/update/remove, storage warning, and rollback.

- [ ] **Step 1: Write service-worker registration and UI tests**

Assert no registration in development, a readable unsupported state, install progress, hash failure retaining the old release, and explicit wording that online terrain may be unavailable offline.

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest --run src/offline/register-service-worker.test.ts src/components/OfflineDataManager.test.tsx`.

- [ ] **Step 3: Implement conservative service-worker behavior and build-time shell injection**

Keep `public/sw.js` as a template containing a unique `__APP_SHELL_MANIFEST__` placeholder. `inject-service-worker-manifest.mjs` walks the completed `dist` tree, selects only HTML, hashed first-party JS/CSS, local fonts, icons and the basic land outline, then replaces the placeholder in `dist/sw.js` with base-aware URLs and SHA-256 revisions. It rejects a second or missing placeholder. Add the injector as `postbuild` so every production build produces a runnable service worker. Use network-first for `latest.json`, cache-first for content-addressed immutable release files, and never silently cache third-party terrain/satellite tiles for offline redistribution.

The script test builds a temporary `dist` fixture and asserts that unrelated world packages, maps, source maps and third-party tile URLs are not precached.

- [ ] **Step 4: Implement the data manager UI**

Place it under an existing “more/data” entry, not as a modal on first visit. Before install, call `navigator.storage.estimate()`; after explicit install, call `navigator.storage.persist()` when available and report the result honestly.

- [ ] **Step 5: Run tests and commit**

```bash
npx vitest --run src/offline/register-service-worker.test.ts src/components/OfflineDataManager.test.tsx
node --test scripts/inject-service-worker-manifest.test.mjs
git add public/sw.js scripts/inject-service-worker-manifest.mjs scripts/inject-service-worker-manifest.test.mjs src/offline/register-service-worker.ts src/offline/register-service-worker.test.ts src/components/OfflineDataManager.tsx src/components/OfflineDataManager.test.tsx src/app/App.tsx src/i18n/text.ts package.json
git commit -m "feat: install and manage offline history packages"
```

### Task 9: End-to-end release and offline verification

**Files:**
- Create: `src/app/offline-release.integration.test.tsx`
- Create: `docs/release/offline-data-runbook.md`
- Modify: `package.json`

**Interfaces:**
- Produces a repeatable `npm run verify:data-runtime` command.

- [ ] **Step 1: Add integration tests for release switching and offline restart**

Test:

1. Load release A.
2. Install release B with one changed package.
3. Verify only changed hashes are downloaded.
4. Activate B and confirm map, timeline, search, and detail share B.
5. Simulate an offline restart.
6. Confirm core + China territory still work.
7. Corrupt release C and confirm B remains active.

- [ ] **Step 2: Run focused integration tests**

Run: `npx vitest --run src/app/offline-release.integration.test.tsx`  
Expected: PASS.

- [ ] **Step 3: Write operator documentation**

Document package generation, verification, promotion from preview to stable, rollback, browser storage limitations, unsupported third-party basemaps, and cleanup of abandoned releases.

- [ ] **Step 4: Run full validation**

```bash
npm run build:content-release -- --release verification --profile internal-research
npm run verify:content-release -- public/releases/verification/manifest.json
npm run build:knowledge-coverage
npx vitest --run --exclude '.worktrees/**'
npm run build
git diff --check
```

Expected: all commands PASS; public map release remains separately blocked until compliance approval.

- [ ] **Step 5: Commit**

```bash
git add src/app/offline-release.integration.test.tsx docs/release/offline-data-runbook.md package.json
git commit -m "test: verify versioned offline historical releases"
```

## Completion Boundary

This plan ends with a versioned, offline-capable read path and the existing catalogs acting only as a temporary authoring adapter. PostgreSQL/PostGIS authoring, object-storage upload, reader submission APIs, moderation, and automated proposal workers are a later project; they must produce the same `ReleaseManifest` and cannot bypass the accepted-review boundary.
