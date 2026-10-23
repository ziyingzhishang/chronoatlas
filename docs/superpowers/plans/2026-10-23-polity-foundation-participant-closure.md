# 政权建立事件参与端点闭合 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the three existing polity-foundation event-detail participant endpoints without changing dates, relationships, capital/city data, or event definitions.

**Architecture:** Keep the existing event and event-detail catalogs as the source of truth. Add only direct participant records to the three existing detail entries, then use a focused regression test plus existing coverage audits to prove reference closure and preserve review boundaries.

**Tech Stack:** TypeScript, Vitest, existing `eventDetails`, `events`, `event-detail-coverage`, `polity-coverage`, and source/person catalogs.

## Global Constraints

- Modify only `src/data/event-details.ts`, related tests, and related audit/plan documentation.
- Do not upgrade `datePrecision` or `verification`.
- Do not modify `people.ts`, `claims.ts`, capital/city data, or event definitions in `events.ts`.
- Use only existing person IDs: `wang-mang`, `yao-chang`, and `li-yuan`.
- Preserve the existing `needs-review` boundary for partial verification and approximate/range dates.

---

### Task 1: Add the failing participant-closure regression test

**Files:**
- Create: `src/data/polity-foundation-participant-closure.test.ts`

**Interfaces:**
- Consumes: `events`, `eventDetails`, `buildEventDetailCoverageReport`, `auditPolityCoverage`, `sourceById`.
- Produces: A regression contract for the three specified event-detail participant endpoints and their coverage behavior.

- [ ] **Step 1: Write the failing test**

Create a table of the three event IDs and expected person IDs. Assert that each event exists with its existing year and date precision, each detail has exactly the expected participant ID, and each participant is a direct role record whose note/role preserves the event's temporal and scope boundary. Assert all event/detail source IDs resolve, location and polity endpoints are present, and all related event IDs resolve.

Also assert the coverage boundary:

```ts
expect(report.unresolvedEventIds).toEqual([]);
expect(report.items.find((item) => item.eventId === 'tang-founded-changan')?.status).toBe('covered');
expect(report.items.find((item) => item.eventId === 'changan-xin-founded')?.status).toBe('needs-review');
expect(report.items.find((item) => item.eventId === 'changan-later-qin')?.status).toBe('needs-review');
expect(auditPolityCoverage().establishmentCoverageRate).toBe(1);
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- --run src/data/polity-foundation-participant-closure.test.ts
```

Expected: FAIL because the three existing detail entries currently have empty `participants` arrays.

### Task 2: Add the three existing direct participant records

**Files:**
- Modify: `src/data/event-details.ts` at the entries for `changan-xin-founded`, `changan-later-qin`, and `tang-founded-changan`.

**Interfaces:**
- Consumes: The failing regression contract from Task 1.
- Produces: Three resolvable `participants` records using existing person IDs and bounded role/note text.

- [ ] **Step 1: Add the minimal production data**

Add exactly one participant to each detail:

```ts
{ personId: 'wang-mang', role: '公元9年接受禅让、改国号并建立新朝的核心统治者', note: '仅对应受禅建新节点；不把新末战争或新朝对西汉旧境的全部控制前推到公元9年。' }
{ personId: 'yao-chang', role: '384年后秦形成及其后取得长安阶段的核心建立者', note: '对应384年形成与386年前后据长安的连续阶段；不把两年合并为同日，也不把长安节点扩展为后秦全域控制。' }
{ personId: 'li-yuan', role: '618年在长安受禅即位并建立唐朝的君主', note: '仅对应618年唐建国政治节点；不把建国节点扩展为唐已控制隋旧境全部地区。' }
```

Do not change any other fields.

- [ ] **Step 2: Run the focused test to verify it passes**

Run:

```bash
npm test -- --run src/data/polity-foundation-participant-closure.test.ts
```

Expected: PASS, with `tang-founded-changan` covered and the two partial-verification records still needs-review.

### Task 3: Run the related coverage regression suite

**Files:**
- Modify: None unless a test reveals a contradiction in the focused contract.

**Interfaces:**
- Consumes: The updated event-detail catalog and focused regression test.
- Produces: Verified event-detail and polity-foundation coverage results.

- [ ] **Step 1: Run targeted coverage tests**

Run:

```bash
npm test -- --run \
  src/data/polity-foundation-participant-closure.test.ts \
  src/data/event-detail-coverage.test.ts \
  src/data/polity-coverage.test.ts \
  src/data/polity-foundation-events.test.ts \
  src/data/polity-foundation-events-second-batch.test.ts \
  src/data/polity-foundation-events-third-batch.test.ts \
  src/data/polity-foundation-events-fourth-batch.test.ts \
  src/data/polity-foundation-events-fifth-batch.test.ts \
  src/data/polity-foundation-events-sixth-batch.test.ts \
  src/data/polity-foundation-events-seventh-batch.test.ts \
  src/data/polity-foundation-events-eighth-batch.test.ts
```

Expected: All selected tests pass; no unresolved event references appear and no unrelated coverage counts change except the expected `tang-founded-changan` status transition.

- [ ] **Step 2: Inspect the final diff and status**

Run:

```bash
git diff -- src/data/event-details.ts src/data/polity-foundation-participant-closure.test.ts
git status --short
```

Expected: Only the three participant records and the focused test are implementation changes; pre-existing unrelated worktree changes remain untouched.

- [ ] **Step 3: Commit the implementation**

```bash
git add src/data/event-details.ts src/data/polity-foundation-participant-closure.test.ts
git commit -m "feat: close polity foundation participant endpoints"
```
