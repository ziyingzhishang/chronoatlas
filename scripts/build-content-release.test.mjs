import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildContentRelease } from './build-content-release.mjs';

const digest = 'a'.repeat(64);

function fixtureAuthoring() {
  return {
    coreCollections: {
      sources: [{ id: 'cliopatria', title: 'Cliopatria' }],
      events: [
        { id: 'event-b', title: 'B', internalNotes: 'do not publish' },
        { id: 'event-a', title: 'A' },
      ],
    },
    territory: {
      boundaries: [{
        id: 'boundary-a', polityId: 'polity-a', sourceIds: ['cliopatria'],
        geometry: { type: 'Point', coordinates: [1, 2] },
        evidence: { evidenceLevel: 'D', derivation: 'control-centers', reviewStatus: 'source-checked', citations: [], uncertaintyNote: 'Only centers are known.' },
      }, {
        id: 'boundary-reference', polityId: 'polity-a', sourceIds: ['cliopatria'],
        geometry: { type: 'Point', coordinates: [3, 4] }, presentation: 'reference',
        evidence: { evidenceLevel: 'C', derivation: 'nearest-same-polity', reviewStatus: 'source-checked', citations: [], uncertaintyNote: 'Nearest known outline only.' },
      }],
      coverageDecisions: [{
        id: 'gap-a', polityId: 'polity-a', from: 10, to: 11,
        verdict: 'leave-unfilled', sourceBoundaryIds: [], citationIds: ['cliopatria'],
        rationale: 'internal rationale', reviewStatus: 'reviewed',
      }],
      territoryResearchTasks: [{ taskId: 'territory-research:gap-a' }],
    },
    worldChunks: [{
      start: 100, end: 199, filename: '100.json', records: 1,
      bytes: 25, sha256: digest,
    }],
  };
}

test('builds byte-identical manifests and content from the same authoring snapshot', async () => {
  const first = await mkdtemp(path.join(tmpdir(), 'chronoatlas-release-a-'));
  const second = await mkdtemp(path.join(tmpdir(), 'chronoatlas-release-b-'));
  try {
    for (const root of [first, second]) {
      await mkdir(path.join(root, 'data', 'world'), { recursive: true });
      await writeFile(path.join(root, 'data', 'world', '100.json'), '{"records":[{"id":"w"}]}\n');
    }
    const options = {
      releaseId: 'fixture-release', profile: 'internal-research',
      createdAt: '2026-10-26T00:00:00Z', authoring: fixtureAuthoring(),
    };
    const firstResult = await buildContentRelease({ ...options, publicRoot: first });
    const secondResult = await buildContentRelease({ ...options, publicRoot: second });

    assert.deepEqual(firstResult.manifest, secondResult.manifest);
    assert.deepEqual(firstResult.manifest.packages, secondResult.manifest.packages);
    assert.deepEqual(
      firstResult.manifest.packages.filter((releasePackage) => ['core-zh', 'china-territory'].includes(releasePackage.id))
        .flatMap((releasePackage) => releasePackage.files.map((file) => file.uri)),
      ['releases/fixture-release/core-zh.json', 'releases/fixture-release/china-territory.json'],
    );
    assert.equal(firstResult.manifest.packages.find((releasePackage) => releasePackage.kind === 'world').files[0].uri, 'releases/fixture-release/world-ce-100.json');
    await readFile(path.join(first, 'releases', 'fixture-release', 'world-ce-100.json'));
    const firstCore = await readFile(path.join(first, 'releases', 'fixture-release', 'core-zh.json'), 'utf8');
    const secondCore = await readFile(path.join(second, 'releases', 'fixture-release', 'core-zh.json'), 'utf8');
    assert.equal(firstCore, secondCore);
    assert.equal(firstCore.includes('internalNotes'), false);
    assert.equal(firstCore.includes('territory-research:'), false);
    assert.deepEqual(JSON.parse(firstCore).events.map((event) => event.id), ['event-a', 'event-b']);
  } finally {
    await Promise.all([rm(first, { recursive: true, force: true }), rm(second, { recursive: true, force: true })]);
  }
});

test('publishes leave-unfilled as a conclusion without attaching geometry', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'chronoatlas-release-leave-unfilled-'));
  try {
    await mkdir(path.join(root, 'data', 'world'), { recursive: true });
    await writeFile(path.join(root, 'data', 'world', '100.json'), '{"records":[{"id":"w"}]}\n');
    await buildContentRelease({
      publicRoot: root, releaseId: 'fixture-release', profile: 'internal-research',
      createdAt: '2026-10-26T00:00:00Z', authoring: fixtureAuthoring(),
    });
    const territory = JSON.parse(await readFile(
      path.join(root, 'releases', 'fixture-release', 'china-territory.json'), 'utf8',
    ));
    assert.deepEqual(territory.coverageConclusions, [{
      polityId: 'polity-a', from: 10, to: 11,
      representation: 'leave-unfilled', sourceIds: ['cliopatria'],
    }]);
    assert.equal('geometryIds' in territory.coverageConclusions[0], false);
    assert.equal(JSON.stringify(territory).includes('reviewStatus'), false);
    assert.equal(JSON.stringify(territory).includes('rationale'), false);
    assert.equal(territory.boundaries.find((boundary) => boundary.id === 'boundary-a').mapRepresentation, 'control-centers');
    assert.equal(territory.boundaries.find((boundary) => boundary.id === 'boundary-reference').mapRepresentation, 'reference-boundary');
    assert.equal(JSON.stringify(territory).includes('evidenceLevel'), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects an unsafe release id before writing outside the releases directory', async () => {
  const outer = await mkdtemp(path.join(tmpdir(), 'chronoatlas-release-path-'));
  const root = path.join(outer, 'public');
  try {
    await mkdir(path.join(root, 'data', 'world'), { recursive: true });
    await writeFile(path.join(root, 'data', 'world', '100.json'), '{"records":[{"id":"w"}]}\n');
    await assert.rejects(() => buildContentRelease({
      publicRoot: root, releaseId: '../escape', profile: 'internal-research',
      createdAt: '2026-10-26T00:00:00Z', authoring: fixtureAuthoring(),
    }), /releaseId|safe/i);
    await assert.rejects(() => readFile(path.join(outer, 'escape', 'manifest.json')));
  } finally {
    await rm(outer, { recursive: true, force: true });
  }
});

test('refuses to reuse an immutable release whose files were tampered with', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'chronoatlas-release-tamper-'));
  try {
    await mkdir(path.join(root, 'data', 'world'), { recursive: true });
    await writeFile(path.join(root, 'data', 'world', '100.json'), '{"records":[{"id":"w"}]}\n');
    const options = {
      publicRoot: root, releaseId: 'fixture-release', profile: 'internal-research',
      createdAt: '2026-10-26T00:00:00Z', authoring: fixtureAuthoring(),
    };
    await buildContentRelease(options);
    await writeFile(path.join(root, 'releases', 'fixture-release', 'core-zh.json'), '{"tampered":true}\n');
    await assert.rejects(() => buildContentRelease(options), /immutable|different|tamper/i);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('publishes a stable offline release pointer only after immutable files are complete', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'chronoatlas-release-public-'));
  const releaseId = 'a'.repeat(40);
  try {
    await mkdir(path.join(root, 'data', 'world'), { recursive: true });
    await writeFile(path.join(root, 'data', 'world', '100.json'), '{"records":[{"id":"w"}]}\n');

    const result = await buildContentRelease({
      publicRoot: root, releaseId, profile: 'offline-public', channel: 'stable',
      writeLatest: true, createdAt: '2026-10-26T00:00:00Z', authoring: fixtureAuthoring(),
    });

    assert.equal(result.manifest.channel, 'stable');
    assert.equal(result.manifest.complianceProfile, 'offline-public');
    const manifestText = await readFile(result.manifestPath, 'utf8');
    const pointer = JSON.parse(await readFile(path.join(root, 'releases', 'latest.json'), 'utf8'));
    assert.deepEqual(pointer, {
      releaseId,
      manifestSha256: createHash('sha256').update(manifestText).digest('hex'),
    });
    await Promise.all([
      readFile(path.join(root, 'releases', releaseId, 'core-zh.json')),
      readFile(path.join(root, 'releases', releaseId, 'china-territory.json')),
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('refuses to point latest at a research or preview release', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'chronoatlas-release-private-pointer-'));
  try {
    await mkdir(path.join(root, 'data', 'world'), { recursive: true });
    await writeFile(path.join(root, 'data', 'world', '100.json'), '{"records":[{"id":"w"}]}\n');

    for (const options of [
      { profile: 'internal-research', channel: 'stable' },
      { profile: 'offline-public', channel: 'preview' },
    ]) {
      await assert.rejects(() => buildContentRelease({
        publicRoot: root, releaseId: 'b'.repeat(40), writeLatest: true,
        ...options, createdAt: '2026-10-26T00:00:00Z', authoring: fixtureAuthoring(),
      }), /latest.*offline-public.*stable|offline-public.*stable.*latest/i);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
