import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildContentRelease } from './build-content-release.mjs';
import { verifyContentRelease } from './verify-content-release.mjs';

async function buildFixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'chronoatlas-verify-release-'));
  await mkdir(path.join(root, 'data', 'world'), { recursive: true });
  const worldText = '{"records":[{"id":"w","sourceIds":["cliopatria"]}]}\n';
  await writeFile(path.join(root, 'data', 'world', '100.json'), worldText);
  const authoring = {
    coreCollections: { sources: [{ id: 'cliopatria', title: 'Cliopatria' }], events: [] },
    territory: {
      boundaries: [],
      coverageDecisions: [{
        id: 'gap-a', polityId: 'p', from: 100, to: 101, verdict: 'leave-unfilled',
        sourceBoundaryIds: [], citationIds: ['cliopatria'], reviewStatus: 'reviewed', rationale: 'private',
      }],
    },
    worldChunks: [{ start: 100, end: 199, filename: '100.json', records: 1 }],
  };
  const result = await buildContentRelease({
    publicRoot: root, releaseId: 'fixture-release', profile: 'internal-research',
    createdAt: '2026-10-26T00:00:00Z', authoring,
  });
  return { root, manifestPath: result.manifestPath };
}

test('verifies hashes, counts, source references, licenses and leave-unfilled semantics', async () => {
  const fixture = await buildFixture();
  try {
    const result = await verifyContentRelease(fixture.manifestPath, {
      allowedLicenseIds: ['MIT', 'CC-BY-4.0', 'GPL-3.0'],
    });
    assert.equal(result.releaseId, 'fixture-release');
    assert.equal(result.files, 3);
    assert.equal(result.manifestSha256, createHash('sha256').update(await readFile(fixture.manifestPath)).digest('hex'));
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('rejects tampered files and reports the failed hash', async () => {
  const fixture = await buildFixture();
  try {
    const manifest = JSON.parse(await readFile(fixture.manifestPath, 'utf8'));
    const coreUri = manifest.packages.find((item) => item.id === 'core-zh').files[0].uri;
    await writeFile(path.join(fixture.root, coreUri), '{"sources":[]}\n');
    await assert.rejects(
      () => verifyContentRelease(fixture.manifestPath, { allowedLicenseIds: ['MIT', 'CC-BY-4.0', 'GPL-3.0'] }),
      /sha-?256|hash/i,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('rejects geometry attached to a leave-unfilled conclusion', async () => {
  const fixture = await buildFixture();
  try {
    const manifest = JSON.parse(await readFile(fixture.manifestPath, 'utf8'));
    const territoryFile = manifest.packages.find((item) => item.id === 'china-territory').files[0];
    const territoryPath = path.join(fixture.root, territoryFile.uri);
    const territory = JSON.parse(await readFile(territoryPath, 'utf8'));
    territory.coverageConclusions[0].geometryIds = ['invented'];
    const changed = `${JSON.stringify(territory)}\n`;
    await writeFile(territoryPath, changed);
    const crypto = await import('node:crypto');
    territoryFile.sha256 = crypto.createHash('sha256').update(changed).digest('hex');
    territoryFile.sourceDigest = territoryFile.sha256;
    territoryFile.bytes = Buffer.byteLength(changed);
    await writeFile(fixture.manifestPath, `${JSON.stringify(manifest)}\n`);
    await assert.rejects(
      () => verifyContentRelease(fixture.manifestPath, { allowedLicenseIds: ['MIT', 'CC-BY-4.0', 'GPL-3.0'] }),
      /leave-unfilled.*geometry/i,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('rejects package dependencies that are not present in the same release', async () => {
  const fixture = await buildFixture();
  try {
    const manifest = JSON.parse(await readFile(fixture.manifestPath, 'utf8'));
    manifest.packages.find((item) => item.id === 'china-territory').dependencies = ['missing-core'];
    await writeFile(fixture.manifestPath, `${JSON.stringify(manifest)}\n`);
    await assert.rejects(
      () => verifyContentRelease(fixture.manifestPath, { allowedLicenseIds: ['MIT', 'CC-BY-4.0', 'GPL-3.0'] }),
      /missing dependency/i,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('rejects encoded traversal in release file URIs', async () => {
  const fixture = await buildFixture();
  try {
    const manifest = JSON.parse(await readFile(fixture.manifestPath, 'utf8'));
    manifest.packages[0].files[0].uri = 'releases/fixture-release/%2e%2e/secret.json';
    await writeFile(fixture.manifestPath, `${JSON.stringify(manifest)}\n`);
    await assert.rejects(
      () => verifyContentRelease(fixture.manifestPath, { allowedLicenseIds: ['MIT', 'CC-BY-4.0', 'GPL-3.0'] }),
      /unsafe.*uri|traversal/i,
    );
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});
