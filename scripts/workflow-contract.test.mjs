import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const qualityWorkflowUrl = new URL('../.github/workflows/quality.yml', import.meta.url);
const pagesWorkflowUrl = new URL('../.github/workflows/pages.yml', import.meta.url);
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

test('Pages deployment is gated by public-map approval and uploads only after the gate', async () => {
  const source = await readFile(pagesWorkflowUrl, 'utf8');
  const build = source.match(/^  build:\n([\s\S]*?)(?=^  deploy:)/m)?.[1] ?? '';

  assert.doesNotMatch(source, /pull_request_target:/);
  assert.match(build, /npm run verify:map-release/);
  assert.match(build, /actions\/upload-pages-artifact@[0-9a-f]{40}/);
  assert.match(source, /actions\/deploy-pages@[0-9a-f]{40}/);
  assert.match(source, /pages:\s*write/);
  assert.match(source, /id-token:\s*write/);

  const releaseGate = build.indexOf('npm run verify:map-release');
  const artifactUpload = build.indexOf('actions/upload-pages-artifact@');
  assert.ok(releaseGate >= 0 && releaseGate < artifactUpload,
    'map release approval must run before the Pages artifact is uploaded');
});

test('Pages workflow pins every action and keeps build and deploy permissions scoped', async () => {
  const source = await readFile(pagesWorkflowUrl, 'utf8');
  const build = source.match(/^  build:\n([\s\S]*?)(?=^  deploy:)/m)?.[1] ?? '';
  const deploy = source.match(/^  deploy:\n([\s\S]*)$/m)?.[1] ?? '';
  const actionReferences = [...source.matchAll(/^\s*uses:\s*(\S+)\s*$/gm)]
    .map(([, reference]) => reference);

  assert.ok(actionReferences.length >= 5);
  for (const reference of actionReferences) {
    assert.match(reference, /^[^@\s]+@[0-9a-f]{40}$/);
  }

  assert.match(build, /permissions:\s*\n\s{6}contents:\s*read/);
  assert.doesNotMatch(build, /^\s{6}[a-z-]+:\s*write\s*$/m);
  assert.match(deploy, /permissions:\s*\n\s{6}contents:\s*read\s*\n\s{6}pages:\s*write\s*\n\s{6}id-token:\s*write/);
  assert.match(deploy, /environment:\s*\n\s{6}name:\s*github-pages/);

  assert.match(build, /actions\/checkout@[0-9a-f]{40}/);
  assert.match(build, /actions\/setup-node@[0-9a-f]{40}/);
  assert.match(build, /actions\/upload-pages-artifact@[0-9a-f]{40}/);
  assert.doesNotMatch(build, /actions\/configure-pages@/);
  assert.match(deploy, /actions\/configure-pages@[0-9a-f]{40}/);
  assert.match(deploy, /actions\/deploy-pages@[0-9a-f]{40}/);
});

test('Pages workflow deploys only main pushes or explicit manual runs', async () => {
  const source = await readFile(pagesWorkflowUrl, 'utf8');
  const events = source.match(/^on:\n([\s\S]*?)(?=^concurrency:)/m)?.[1] ?? '';
  const eventNames = [...events.matchAll(/^  ([a-z_-]+):/gm)].map(([, name]) => name);

  assert.deepEqual(eventNames, ['push', 'workflow_dispatch']);
  assert.match(events, /^  push:\n    branches:\n      - main\n  workflow_dispatch:\s*$/m);
});

test('Pages build refuses to publish a manual run from any ref except main', async () => {
  const source = await readFile(pagesWorkflowUrl, 'utf8');
  const build = source.match(/^  build:\n([\s\S]*?)(?=^  deploy:)/m)?.[1] ?? '';

  assert.match(build, /^    if:\s*github\.ref\s*==\s*['"]refs\/heads\/main['"]\s*$/m);
});

test('Pages build pins npm, uses the project base and uploads only dist', async () => {
  const source = await readFile(pagesWorkflowUrl, 'utf8');
  const build = source.match(/^  build:\n([\s\S]*?)(?=^  deploy:)/m)?.[1] ?? '';

  const npmPin = build.indexOf('npm install --global npm@11.14.1');
  const npmCi = build.indexOf('npm ci');
  assert.ok(npmPin >= 0 && npmPin < npmCi, 'npm must be pinned before npm ci');

  const baseDeclarations = build.match(/VITE_BASE_PATH:\s*\/chronoatlas\//g) ?? [];
  assert.equal(baseDeclarations.length, 2);
  assert.match(build, /VITE_BASE_PATH:\s*\/chronoatlas\/[\s\S]*?npm run build/);
  assert.match(build, /VITE_BASE_PATH:\s*\/chronoatlas\/[\s\S]*?npm run verify:pages-artifact -- dist/);
  assert.match(build, /actions\/upload-pages-artifact@[0-9a-f]{40}[\s\S]*?with:\s*\n\s{10}path:\s*dist/);
});
