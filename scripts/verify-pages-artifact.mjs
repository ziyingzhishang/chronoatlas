import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { verifyContentRelease } from './verify-content-release.mjs';

const CONTENT_EXTENSIONS = new Set([
  '.css', '.geojson', '.html', '.js', '.json', '.md', '.mjs', '.svg', '.topojson',
  '.txt', '.webmanifest', '.xml',
]);
const ASSET_EXTENSIONS = new Set([
  '.avif', '.css', '.gif', '.ico', '.jpeg', '.jpg', '.js', '.json', '.mjs',
  '.otf', '.png', '.svg', '.ttf', '.webp', '.woff', '.woff2', '.xml',
]);
const DATA_EXTENSIONS = new Set([
  '.avif', '.geojson', '.gif', '.jpeg', '.jpg', '.json', '.md', '.pmtiles',
  '.png', '.svg', '.topojson', '.txt', '.webp', '.xml',
]);

function normalizeBase(base) {
  const value = base || '/';
  let decodedSegments;
  try {
    decodedSegments = value.split('/').map((part) => decodeURIComponent(part));
  } catch {
    throw new Error(`Expected a safe root-relative Vite base, received: ${value}`);
  }
  const unsafeDecodedSegment = decodedSegments.some((part) => (
    part === '.' || part === '..' || /[\\/?#\u0000-\u001f\u007f]/.test(part)
  ));
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('//')
    || /[\\?#\u0000-\u0020\u007f]/.test(value) || unsafeDecodedSegment) {
    throw new Error(`Expected a safe root-relative Vite base, received: ${value}`);
  }
  return value.endsWith('/') ? value : `${value}/`;
}

function isAllowedLayout(relativePath) {
  if (relativePath === 'index.html' || relativePath === '404.html'
    || relativePath === 'sw.js' || relativePath === 'manifest.webmanifest'
    || relativePath === 'favicon.ico' || relativePath === 'robots.txt') {
    return true;
  }
  const extension = path.posix.extname(relativePath).toLowerCase();
  if (relativePath.startsWith('assets/')) return ASSET_EXTENSIONS.has(extension);
  if (relativePath.startsWith('data/')) return DATA_EXTENSIONS.has(extension);
  if (relativePath === 'releases/latest.json') return true;
  if (/^releases\/[a-f0-9]{40}\/(?:manifest|core-zh|china-territory)\.json$/.test(relativePath)) return true;
  return false;
}

function fileNameViolations(relativePath) {
  const violations = [];
  const baseName = path.posix.basename(relativePath);
  const extension = path.posix.extname(relativePath).toLowerCase();
  const pathSegments = relativePath.split('/');

  if (extension === '.map') violations.push('source map files are forbidden');
  if (extension === '.ts' || extension === '.tsx') violations.push('TypeScript source files are forbidden');
  if (/^\.env/i.test(baseName)) violations.push('.env files are forbidden');
  if (pathSegments.some((part) => /^\.git/i.test(part))) {
    violations.push('Git metadata is forbidden');
  }
  if (/(?:^|[.\-_])(?:test|spec)(?:[.\-_]|$)/i.test(baseName)) {
    violations.push('test or spec files are forbidden');
  }
  if (pathSegments.slice(0, -1).some((part) => /^(?:test|tests|spec|specs)$/i.test(part))) {
    violations.push('test or spec directory files are forbidden');
  }
  if (/(?:territory-research|research-tasks?|coverage-decisions|internal-audit|review-ledger)/i.test(relativePath)) {
    violations.push('internal research ledger files are forbidden');
  }
  if (!isAllowedLayout(relativePath)) {
    violations.push('file is outside the allow-listed artifact layout');
  }
  return violations;
}

function contentViolations(relativePath, content, base) {
  const violations = [];
  const extension = path.posix.extname(relativePath).toLowerCase();
  if (/sourceMappingURL\s*=/.test(content)) violations.push('sourceMappingURL is forbidden');

  if (base !== '/' && ['.html', '.js', '.mjs'].includes(extension)) {
    const rootAsset = /(^|["'`(=:\s])\/(?:assets|data)\//m;
    if (rootAsset.test(content)) {
      violations.push(`root-relative asset or data URL is forbidden for base ${base}`);
    }
  }

  const sensitivePatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bAIza[0-9A-Za-z_-]{35}\b/,
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  ];
  if (sensitivePatterns.some((pattern) => pattern.test(content))) {
    violations.push('common sensitive credential signature detected');
  }
  return violations;
}

async function collectFiles(root, directory = root, violations = []) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(root, absolutePath).split(path.sep).join('/');
    const stat = await lstat(absolutePath);
    if (stat.isSymbolicLink()) {
      violations.push(`${relativePath}: symbolic links are forbidden`);
      continue;
    }
    if (stat.isDirectory()) {
      files.push(...await collectFiles(root, absolutePath, violations));
      continue;
    }
    if (stat.isFile()) files.push({ absolutePath, relativePath });
  }
  return files;
}

async function verifyPublicRelease(root, files, violations) {
  const releaseFiles = files.filter(({ relativePath }) => relativePath.startsWith('releases/'));
  if (releaseFiles.length === 0) return;

  const latest = releaseFiles.find(({ relativePath }) => relativePath === 'releases/latest.json');
  if (!latest) {
    violations.push('releases/latest.json: required when release files are present');
    return;
  }

  let pointer;
  try {
    pointer = JSON.parse(await readFile(latest.absolutePath, 'utf8'));
  } catch (error) {
    violations.push(`releases/latest.json: invalid JSON: ${error.message}`);
    return;
  }
  const pointerKeys = pointer && typeof pointer === 'object' && !Array.isArray(pointer)
    ? Object.keys(pointer).sort()
    : [];
  if (pointerKeys.join(',') !== 'manifestSha256,releaseId'
    || !/^[a-f0-9]{40}$/.test(pointer?.releaseId ?? '')
    || !/^[a-f0-9]{64}$/.test(pointer?.manifestSha256 ?? '')) {
    violations.push('releases/latest.json: expected only immutable releaseId and manifestSha256');
    return;
  }

  const releaseId = pointer.releaseId;
  const expectedReleaseFiles = new Set([
    'releases/latest.json',
    `releases/${releaseId}/manifest.json`,
    `releases/${releaseId}/core-zh.json`,
    `releases/${releaseId}/china-territory.json`,
  ]);
  for (const { relativePath } of releaseFiles) {
    if (!expectedReleaseFiles.has(relativePath)) {
      violations.push(`${relativePath}: unexpected release file; only the latest immutable release is public`);
    }
  }
  for (const relativePath of expectedReleaseFiles) {
    if (!releaseFiles.some((file) => file.relativePath === relativePath)) {
      violations.push(`${relativePath}: required public release file is missing`);
    }
  }

  const manifestFile = releaseFiles.find(({ relativePath }) => (
    relativePath === `releases/${releaseId}/manifest.json`
  ));
  if (!manifestFile) return;

  const manifestBytes = await readFile(manifestFile.absolutePath);
  const manifestDigest = createHash('sha256').update(manifestBytes).digest('hex');
  if (manifestDigest !== pointer.manifestSha256) {
    violations.push(`${manifestFile.relativePath}: manifest hash does not match releases/latest.json`);
  }

  let manifest;
  try {
    manifest = JSON.parse(manifestBytes.toString('utf8'));
  } catch (error) {
    violations.push(`${manifestFile.relativePath}: invalid JSON: ${error.message}`);
    return;
  }
  if (manifest.releaseId !== releaseId) {
    violations.push(`${manifestFile.relativePath}: releaseId does not match releases/latest.json`);
  }
  if (manifest.channel !== 'stable' || manifest.complianceProfile !== 'offline-public') {
    violations.push(`${manifestFile.relativePath}: Pages releases must be stable and offline-public`);
  }

  const packageById = new Map(Array.isArray(manifest.packages)
    ? manifest.packages.map((releasePackage) => [releasePackage?.id, releasePackage])
    : []);
  for (const [packageId, filename] of [
    ['core-zh', 'core-zh.json'],
    ['china-territory', 'china-territory.json'],
  ]) {
    const releasePackage = packageById.get(packageId);
    const expectedUri = `releases/${releaseId}/${filename}`;
    if (!releasePackage || releasePackage.required !== true
      || releasePackage.files?.length !== 1 || releasePackage.files[0]?.uri !== expectedUri) {
      violations.push(`${manifestFile.relativePath}: required package ${packageId} must contain only ${expectedUri}`);
    }
  }
  const ownedUris = (manifest.packages ?? [])
    .flatMap((releasePackage) => releasePackage?.files ?? [])
    .map((file) => file?.uri)
    .filter((uri) => typeof uri === 'string' && uri.startsWith(`releases/${releaseId}/`));
  const expectedOwnedUris = [
    `releases/${releaseId}/china-territory.json`,
    `releases/${releaseId}/core-zh.json`,
  ];
  if ([...ownedUris].sort().join('\n') !== expectedOwnedUris.join('\n')) {
    violations.push(`${manifestFile.relativePath}: release-owned files must be exactly core-zh.json and china-territory.json`);
  }

  try {
    await verifyContentRelease(manifestFile.absolutePath);
  } catch (error) {
    violations.push(`${manifestFile.relativePath}: ${error.message}`);
  }
}

export async function verifyArtifact(artifactDirectory, options = {}) {
  const root = path.resolve(artifactDirectory);
  const base = normalizeBase(options.base ?? process.env.VITE_BASE_PATH ?? '/');
  const violations = [];
  const files = await collectFiles(root, root, violations);

  if (!files.some(({ relativePath }) => relativePath === 'index.html')) {
    violations.push('index.html: required entry file is missing');
  }

  for (const file of files) {
    for (const reason of fileNameViolations(file.relativePath)) {
      violations.push(`${file.relativePath}: ${reason}`);
    }
    const extension = path.posix.extname(file.relativePath).toLowerCase();
    if (CONTENT_EXTENSIONS.has(extension)) {
      const content = await readFile(file.absolutePath, 'utf8');
      for (const reason of contentViolations(file.relativePath, content, base)) {
        violations.push(`${file.relativePath}: ${reason}`);
      }
    }
  }

  await verifyPublicRelease(root, files, violations);

  if (violations.length > 0) {
    throw new Error(`Pages artifact verification failed:\n- ${violations.sort().join('\n- ')}`);
  }
  return { base, files: files.map(({ relativePath }) => relativePath).sort() };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  const artifactDirectory = process.argv[2];
  if (!artifactDirectory) {
    console.error('Usage: node scripts/verify-pages-artifact.mjs <artifact-directory>');
    process.exitCode = 1;
  } else {
    verifyArtifact(artifactDirectory)
      .then(({ base, files }) => console.log(`Verified ${files.length} Pages artifact files for base ${base}`))
      .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      });
  }
}
