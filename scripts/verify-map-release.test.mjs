import assert from 'node:assert/strict';
import test from 'node:test';

import { verifyMapApprovalForRelease } from './verify-map-release.mjs';

const manifest = Buffer.from(`${JSON.stringify({ releaseId: 'release-a', packages: [] })}\n`);
const approval = {
  status: 'approved-for-public-release', reviewNumber: 'GS(2026)0001号', reviewExpiresAt: '2099-10-20',
  approvedReleaseId: 'release-a', approvedReleaseManifestSha256: '',
  checkedSources: [{ id: 'modern-reference', license: 'public domain', attribution: 'Natural Earth' }],
  requiredNotices: ['review number displayed'],
};

test('verifies both the immutable manifest digest and release id', async () => {
  const { createHash } = await import('node:crypto');
  const digest = createHash('sha256').update(manifest).digest('hex');
  assert.deepEqual(
    verifyMapApprovalForRelease({ ...approval, approvedReleaseManifestSha256: digest }, manifest, new Date('2026-10-20')),
    [],
  );
});

test('rejects approval for another release even when its digest is copied', async () => {
  const { createHash } = await import('node:crypto');
  const digest = createHash('sha256').update(manifest).digest('hex');
  const issues = verifyMapApprovalForRelease({
    ...approval, approvedReleaseId: 'release-b', approvedReleaseManifestSha256: digest,
  }, manifest, new Date('2026-10-20'));
  assert.ok(issues.includes('map approval does not match this release id'));
});
