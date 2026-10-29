import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLACEHOLDER = '__APP_SHELL_MANIFEST__';
const HASHED_ASSET = /-[A-Za-z0-9_-]{8,}\.(?:css|js|mjs)$/i;
const HASHED_FONT = /-[A-Za-z0-9_-]{8,}\.(?:otf|ttf|woff2?)$/i;
const HASHED_ICON = /(?:icon|logo|mark|pin)[^/]*-[A-Za-z0-9_-]{8,}\.(?:ico|png|svg|webp)$/i;
const LAND_OUTLINE = /^(?:data\/base\/)?(?:basic-)?land-outline\.(?:geojson|json|topojson)$/i;

export async function injectServiceWorkerManifest(distDirectory, options = {}) {
  const root = path.resolve(distDirectory);
  const base = normalizeBase(options.base ?? process.env.VITE_BASE_PATH ?? '/');
  const workerPath = path.join(root, 'sw.js');
  const template = await readFile(workerPath, 'utf8');
  const placeholderCount = template.split(PLACEHOLDER).length - 1;
  if (placeholderCount !== 1) throw new Error(`Service worker must contain exactly one ${PLACEHOLDER} placeholder`);

  const files = await collectFiles(root);
  const selected = files.filter(isAppShellFile).sort();
  if (!selected.includes('index.html')) throw new Error('Completed dist is missing index.html');
  const entries = await Promise.all(selected.map(async (relativePath) => ({
    url: `${base}${relativePath}`,
    revision: createHash('sha256').update(await readFile(path.join(root, ...relativePath.split('/')))).digest('hex'),
  })));
  await writeFile(workerPath, template.replace(PLACEHOLDER, JSON.stringify(entries)));
  return entries;
}

function isAppShellFile(relativePath) {
  if (relativePath === 'index.html' || relativePath === '404.html' || relativePath === 'favicon.ico') return true;
  if (relativePath.endsWith('.map') || relativePath.startsWith('data/world/') || relativePath.startsWith('releases/')) return false;
  if (relativePath.startsWith('assets/')) {
    return HASHED_ASSET.test(relativePath) || HASHED_FONT.test(relativePath) || HASHED_ICON.test(relativePath);
  }
  return LAND_OUTLINE.test(relativePath);
}

async function collectFiles(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(root, absolute));
    else if (entry.isFile()) files.push(path.relative(root, absolute).split(path.sep).join('/'));
  }
  return files;
}

function normalizeBase(value) {
  const base = value || '/';
  let decodedSegments;
  try {
    decodedSegments = base.split('/').map((part) => decodeURIComponent(part));
  } catch {
    throw new Error(`Expected a safe root-relative Vite base, received: ${base}`);
  }
  const unsafeDecodedSegment = decodedSegments.some((part) => (
    part === '.' || part === '..' || /[\\/?#\u0000-\u001f\u007f]/.test(part)
  ));
  if (!base.startsWith('/') || base.startsWith('//') || base.includes('//')
    || /[\\?#\u0000-\u0020\u007f]/.test(base) || unsafeDecodedSegment) {
    throw new Error(`Expected a safe root-relative Vite base, received: ${base}`);
  }
  return base.endsWith('/') ? base : `${base}/`;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  const distDirectory = process.argv[2];
  if (!distDirectory) {
    console.error('Usage: node scripts/inject-service-worker-manifest.mjs <dist-directory>');
    process.exitCode = 1;
  } else {
    injectServiceWorkerManifest(distDirectory)
      .then((entries) => console.log(`Injected ${entries.length} revisioned app-shell files into sw.js`))
      .catch((error) => { console.error(error.message); process.exitCode = 1; });
  }
}
