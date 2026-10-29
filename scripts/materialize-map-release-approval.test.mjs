import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { materializeMapReleaseApproval } from './materialize-map-release-approval.mjs';

const approved = {
  status: 'approved-for-public-release',
  reviewNumber: 'GS(2026)0001号',
  reviewExpiresAt: '2099-10-20',
  approvedReleaseId: 'a'.repeat(40),
  approvedReleaseManifestSha256: 'b'.repeat(64),
  checkedSources: [{ id: 'modern-reference', license: 'public domain', attribution: 'Natural Earth' }],
  requiredNotices: ['review number displayed'],
};

test('materializes one validated protected approval without exposing the transport value', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'chronoatlas-map-approval-'));
  const targetPath = path.join(root, 'map-release-compliance.json');
  try {
    await materializeMapReleaseApproval(JSON.stringify(approved), targetPath, new Date('2026-10-20'));
    assert.deepEqual(JSON.parse(await readFile(targetPath, 'utf8')), approved);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('fails closed without changing the checked-in research status when approval is missing', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'chronoatlas-map-approval-missing-'));
  const targetPath = path.join(root, 'map-release-compliance.json');
  const original = '{"status":"research-only"}\n';
  try {
    await writeFile(targetPath, original);
    await assert.rejects(
      () => materializeMapReleaseApproval('', targetPath, new Date('2026-10-20')),
      /MAP_RELEASE_APPROVAL_JSON is required/,
    );
    assert.equal(await readFile(targetPath, 'utf8'), original);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects an incomplete or research-only injected approval', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'chronoatlas-map-approval-invalid-'));
  const targetPath = path.join(root, 'map-release-compliance.json');
  try {
    await assert.rejects(
      () => materializeMapReleaseApproval(JSON.stringify({ ...approved, status: 'research-only' }), targetPath, new Date('2026-10-20')),
      /protected map approval is invalid/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects unexpected fields instead of publishing transport secrets', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'chronoatlas-map-approval-secret-'));
  const targetPath = path.join(root, 'map-release-compliance.json');
  try {
    await assert.rejects(
      () => materializeMapReleaseApproval(JSON.stringify({ ...approved, token: 'must-not-publish' }), targetPath, new Date('2026-10-20')),
      /unexpected approval field: token/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
