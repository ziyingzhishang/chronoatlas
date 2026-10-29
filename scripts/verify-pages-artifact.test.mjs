import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { stripSourceMapReferences } from './strip-source-map-references.mjs';
import { verifyArtifact } from './verify-pages-artifact.mjs';

async function fixture(files) {
  const root = await mkdtemp(path.join(tmpdir(), 'chronoatlas-pages-'));
  for (const [relativePath, content] of Object.entries(files)) {
    const target = path.join(root, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  return root;
}

const publicReleaseId = 'a'.repeat(40);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function publicReleaseFiles(overrides = {}) {
  const core = '{"sources":[]}\n';
  const territory = '{"boundaries":[],"coverageConclusions":[]}\n';
  const manifest = {
    releaseId: publicReleaseId,
    schemaVersion: '1',
    minimumAppVersion: '0.1.0',
    createdAt: '2026-10-29T00:00:00Z',
    channel: 'stable',
    complianceProfile: 'offline-public',
    packages: [{
      id: 'core-zh', kind: 'content', required: true, dependencies: [],
      compressedBytes: Buffer.byteLength(core), recordCount: 0, licenseIds: ['MIT'],
      files: [{
        uri: `releases/${publicReleaseId}/core-zh.json`, mediaType: 'application/json',
        sha256: sha256(core), bytes: Buffer.byteLength(core), collection: 'core-zh', sourceDigest: sha256(core),
      }],
    }, {
      id: 'china-territory', kind: 'territory', region: 'china', yearRange: [-1, 1],
      required: true, dependencies: ['core-zh'], compressedBytes: Buffer.byteLength(territory),
      recordCount: 0, licenseIds: ['MIT'],
      files: [{
        uri: `releases/${publicReleaseId}/china-territory.json`, mediaType: 'application/json',
        sha256: sha256(territory), bytes: Buffer.byteLength(territory),
        collection: 'china-territory', sourceDigest: sha256(territory),
      }],
    }],
    ...overrides,
  };
  const manifestText = `${JSON.stringify(manifest)}\n`;
  return {
    'index.html': '<main>safe</main>',
    [`releases/${publicReleaseId}/manifest.json`]: manifestText,
    [`releases/${publicReleaseId}/core-zh.json`]: core,
    [`releases/${publicReleaseId}/china-territory.json`]: territory,
    'releases/latest.json': `${JSON.stringify({
      releaseId: publicReleaseId,
      manifestSha256: sha256(manifestText),
    })}\n`,
  };
}

test('accepts a project-base Pages artifact in the public layout', async () => {
  const root = await fixture({
    'index.html': '<script type="module" src="/chronoatlas/assets/app.js"></script>',
    'assets/app.js': 'fetch("/chronoatlas/data/world/0.json")',
    'assets/app.css': 'body { color: black; }',
    'data/world/0.json': '{}\n',
    'data/licenses/source.txt': 'License text\n',
  });

  await assert.doesNotReject(() => verifyArtifact(root, { base: '/chronoatlas/' }));
});

test('accepts a root-base Pages artifact', async () => {
  const root = await fixture({
    'index.html': '<script type="module" src="/assets/app.js"></script>',
    'assets/app.js': 'fetch("/data/world/0.json")',
    'data/world/0.json': '{}\n',
  });

  await assert.doesNotReject(() => verifyArtifact(root, { base: '/' }));
});

test('accepts one hash-verified stable offline release selected by latest', async () => {
  const root = await fixture(publicReleaseFiles());
  await assert.doesNotReject(() => verifyArtifact(root, { base: '/' }));
});

test('rejects research releases even when the pointer and files are internally consistent', async () => {
  const files = publicReleaseFiles({ complianceProfile: 'internal-research' });
  const manifestPath = `releases/${publicReleaseId}/manifest.json`;
  files['releases/latest.json'] = `${JSON.stringify({
    releaseId: publicReleaseId,
    manifestSha256: sha256(files[manifestPath]),
  })}\n`;
  const root = await fixture(files);

  await assert.rejects(() => verifyArtifact(root), /offline-public/i);
});

test('rejects latest manifest hash drift and tampered release files', async () => {
  const pointerFiles = publicReleaseFiles();
  pointerFiles['releases/latest.json'] = `${JSON.stringify({
    releaseId: publicReleaseId,
    manifestSha256: '0'.repeat(64),
  })}\n`;
  const pointerRoot = await fixture(pointerFiles);
  await assert.rejects(() => verifyArtifact(pointerRoot), /manifest.*hash/i);

  const tamperedFiles = publicReleaseFiles();
  tamperedFiles[`releases/${publicReleaseId}/core-zh.json`] = '{"sources":[{"id":"tampered"}]}\n';
  const tamperedRoot = await fixture(tamperedFiles);
  await assert.rejects(() => verifyArtifact(tamperedRoot), /sha-?256|hash mismatch/i);
});

test('rejects arbitrary files or another release beneath releases', async () => {
  const files = publicReleaseFiles();
  files[`releases/${publicReleaseId}/private-notes.json`] = '{}\n';
  files[`releases/${'b'.repeat(40)}/manifest.json`] = '{}\n';
  const root = await fixture(files);

  await assert.rejects(() => verifyArtifact(root), /unexpected release file/i);
});

test('reports every unsafe file, internal ledger and sensitive signature', async () => {
  const root = await fixture({
    'index.html': '<script src="/assets/app.js"></script>',
    'assets/app.js': '//# sourceMappingURL=app.js.map\nconst token = "ghp_abcdefghijklmnopqrstuvwxyz123456";',
    'assets/app.js.map': '{}',
    'assets/source.ts': 'export const secret = true;',
    'data/territory-research-tasks.json': '{}',
    '.env.production': 'TOKEN=secret',
  });

  await assert.rejects(
    () => verifyArtifact(root, { base: '/chronoatlas/' }),
    (error) => {
      assert.match(error.message, /source map/i);
      assert.match(error.message, /root-relative/i);
      assert.match(error.message, /sensitive/i);
      assert.match(error.message, /TypeScript source/i);
      assert.match(error.message, /internal research ledger/i);
      assert.match(error.message, /\.env/i);
      return true;
    },
  );
});

test('rejects test artifacts, Git metadata and files outside the public layout', async () => {
  const root = await fixture({
    'index.html': '<main>safe</main>',
    'assets/app.test.js': 'test("no", () => {});',
    '.git/config': '[core]',
    'server/private.pem': '-----BEGIN PRIVATE KEY-----',
  });

  await assert.rejects(
    () => verifyArtifact(root),
    (error) => {
      assert.match(error.message, /test or spec file/i);
      assert.match(error.message, /Git metadata/i);
      assert.match(error.message, /outside the allow-listed artifact layout/i);
      return true;
    },
  );
});

test('rejects symbolic links without following them', async () => {
  const root = await fixture({ 'index.html': '<main>safe</main>' });
  await mkdir(path.join(root, 'assets'), { recursive: true });
  await symlink('/etc/passwd', path.join(root, 'assets', 'external.txt'));

  await assert.rejects(() => verifyArtifact(root), /symbolic link/i);
});

test('strips generated JavaScript and CSS source map comments before audit', async () => {
  const root = await fixture({
    'index.html': '<main>safe</main>',
    'assets/vendor.mjs': 'export default 1;\n//# sourceMappingURL=vendor.mjs.map\n',
    'assets/app.css': 'body{}\n/*# sourceMappingURL=app.css.map */\n',
  });

  assert.equal(await stripSourceMapReferences(root), 2);
  await assert.doesNotReject(() => verifyArtifact(root));
});

test('preserves source-map-like text embedded in executable content', async () => {
  const root = await fixture({
    'index.html': '<main>safe</main>',
    'assets/vendor.mjs': 'const embedded = `line\n//# sourceMappingURL=inside.map\n`;\n//# sourceMappingURL=vendor.mjs.map\n',
    'assets/app.css': 'body::before{content:"/*# sourceMappingURL=inside.map */"}\n/*# sourceMappingURL=app.css.map */\n',
  });

  assert.equal(await stripSourceMapReferences(root), 2);
  assert.match(await readFile(path.join(root, 'assets/vendor.mjs'), 'utf8'), /inside\.map/);
  assert.match(await readFile(path.join(root, 'assets/app.css'), 'utf8'), /inside\.map/);
  await assert.rejects(() => verifyArtifact(root), /sourceMappingURL/i);
});

test('rejects Git-prefixed and test directory path segments', async () => {
  const root = await fixture({
    'index.html': '<main>safe</main>',
    'assets/.gitattributes/config.js': 'export default 1;',
    'assets/tests/helper.js': 'export default 1;',
  });

  await assert.rejects(
    () => verifyArtifact(root),
    (error) => {
      assert.match(error.message, /Git metadata/i);
      assert.match(error.message, /test or spec directory/i);
      return true;
    },
  );
});

test('rejects malformed and externally resolving deployment bases', async () => {
  const root = await fixture({ 'index.html': '<main>safe</main>' });
  for (const base of ['//evil.example/', '/%2e%2e/', '/chronoatlas/?mode=public', '/chronoatlas/#public']) {
    await assert.rejects(() => verifyArtifact(root, { base }), /safe root-relative Vite base/i);
  }
});

test('scans SVG and web manifests for sensitive credentials', async () => {
  const root = await fixture({
    'index.html': '<main>safe</main>',
    'assets/mark.svg': '<svg><!-- -----BEGIN PRIVATE KEY----- --></svg>',
    'data/map.geojson': '{"token":"ghp_abcdefghijklmnopqrstuvwxyz123456"}',
    'manifest.webmanifest': '{"token":"ghp_abcdefghijklmnopqrstuvwxyz123456"}',
  });

  await assert.rejects(
    () => verifyArtifact(root),
    (error) => {
      assert.match(error.message, /assets\/mark\.svg: common sensitive/i);
      assert.match(error.message, /data\/map\.geojson: common sensitive/i);
      assert.match(error.message, /manifest\.webmanifest: common sensitive/i);
      return true;
    },
  );
});

test('rejects every env-prefixed filename', async () => {
  const root = await fixture({
    'index.html': '<main>safe</main>',
    'assets/.envsecret.js': 'export default "not actually secret";',
  });

  await assert.rejects(() => verifyArtifact(root), /\.env files are forbidden/i);
});
