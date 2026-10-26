import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
