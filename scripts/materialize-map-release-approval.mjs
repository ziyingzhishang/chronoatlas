import { rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { evaluateMapRelease } from '../src/compliance/map-release.ts';

const APPROVAL_KEYS = new Set([
  'status', 'reviewNumber', 'reviewExpiresAt', 'approvedReleaseId',
  'approvedReleaseManifestSha256', 'checkedSources', 'requiredNotices',
]);
const SOURCE_KEYS = new Set(['id', 'license', 'attribution']);

export async function materializeMapReleaseApproval(serialized, targetPath, now = new Date()) {
  if (!serialized?.trim()) throw new Error('MAP_RELEASE_APPROVAL_JSON is required');
  let approval;
  try { approval = JSON.parse(serialized); }
  catch { throw new Error('MAP_RELEASE_APPROVAL_JSON must contain valid JSON'); }
  if (!approval || typeof approval !== 'object' || Array.isArray(approval)) {
    throw new Error('protected map approval must be an object');
  }
  for (const key of Object.keys(approval)) {
    if (!APPROVAL_KEYS.has(key)) throw new Error(`unexpected approval field: ${key}`);
  }
  for (const source of approval.checkedSources ?? []) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) continue;
    for (const key of Object.keys(source)) {
      if (!SOURCE_KEYS.has(key)) throw new Error(`unexpected map source field: ${key}`);
    }
  }
  const issues = evaluateMapRelease(approval, now);
  if (issues.length) throw new Error(`protected map approval is invalid:\n- ${issues.join('\n- ')}`);

  const temporaryPath = `${targetPath}.tmp-${process.pid}`;
  try {
    await writeFile(temporaryPath, `${JSON.stringify(approval, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, targetPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

async function main() {
  const targetPath = path.resolve('public/data/map-release-compliance.json');
  await materializeMapReleaseApproval(process.env.MAP_RELEASE_APPROVAL_JSON, targetPath);
  console.log('Loaded protected public map approval for this workflow run.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) await main();
