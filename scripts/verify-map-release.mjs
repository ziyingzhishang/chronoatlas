import manifest from '../public/data/map-release-compliance.json' with {type:'json'};
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateMapRelease } from '../src/compliance/map-release.ts';

export function verifyMapApprovalForRelease(approval, releaseManifestBytes, now = new Date()) {
  const releaseManifestSha256 = createHash('sha256').update(releaseManifestBytes).digest('hex');
  const release = JSON.parse(releaseManifestBytes.toString('utf8'));
  return evaluateMapRelease(approval, now, releaseManifestSha256, release.releaseId);
}

async function main() {
  const releaseManifestPath = process.argv[2];
  const issues = releaseManifestPath
    ? verifyMapApprovalForRelease(manifest, await readFile(releaseManifestPath))
    : [...evaluateMapRelease(manifest), 'release manifest path is required'];
  if (issues.length) {
    console.error(`Public map release blocked:\n- ${issues.join('\n- ')}`);
    process.exitCode = 1;
  } else {
    console.log(`Public map release approved: ${manifest.reviewNumber}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) await main();
