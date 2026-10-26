import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const qualityWorkflowUrl = new URL('../.github/workflows/quality.yml', import.meta.url);
const packageJsonUrl = new URL('../package.json', import.meta.url);

test('quality workflow validates pull requests with read-only repository access', async () => {
  const source = await readFile(qualityWorkflowUrl, 'utf8');

  assert.match(source, /(?:^|\n)\s*pull_request:\s*(?:\n|$)/);
  assert.match(source, /permissions:\s*\n\s*contents:\s*read/);
  assert.doesNotMatch(source, /^\s*[a-z-]+:\s*write\s*$/m);
  assert.doesNotMatch(source, /permissions:\s*write-all/);
  assert.doesNotMatch(source, /deploy-pages/);
  assert.doesNotMatch(source, /pull_request_target:/);
});

test('quality workflow pins actions and runs the shared release-readiness command', async () => {
  const source = await readFile(qualityWorkflowUrl, 'utf8');

  const actionReferences = [...source.matchAll(/^\s*uses:\s*(\S+)\s*$/gm)]
    .map(([, reference]) => reference);

  assert.ok(actionReferences.length > 0);
  for (const reference of actionReferences) {
    assert.match(reference, /^[^@\s]+@[0-9a-f]{40}$/);
  }
  assert.match(source, /actions\/checkout@[0-9a-f]{40}/);
  assert.match(source, /actions\/setup-node@[0-9a-f]{40}/);
  assert.match(source, /npm run verify:release-readiness/);

  const npmPin = source.indexOf('npm install --global npm@11.14.1');
  const npmCi = source.indexOf('npm ci');
  assert.ok(npmPin >= 0 && npmPin < npmCi, 'npm must be pinned before npm ci');
});

test('release-readiness script contains every non-deploying quality check', async () => {
  const packageJson = JSON.parse(await readFile(packageJsonUrl, 'utf8'));
  const command = packageJson.scripts?.['verify:release-readiness'] ?? '';

  assert.match(command, /npm run build:knowledge-coverage/);
  assert.match(command, /vitest --run --exclude ['"]\.worktrees\/\*\*['"] --exclude ['"]scripts\/\*\*\/\*\.test\.mjs['"]/);
  assert.match(command, /node --test scripts\/\*\.test\.mjs/);
  assert.match(command, /npm run build:notices/);
  assert.match(command, /npm run build/);
  assert.match(command, /npm run verify:pages-artifact -- dist/);
  assert.match(command, /git diff --exit-code -- public\/data\/knowledge-coverage\.json public\/data\/licenses\/project-third-party-notices\.json/);
  assert.match(command, /git diff --check/);
  assert.doesNotMatch(command, /verify:map-release|deploy/);
});
