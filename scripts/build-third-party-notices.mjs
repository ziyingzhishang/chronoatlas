import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REQUIRED_DATA_FIELDS = ['name', 'version', 'license', 'source', 'attribution'];

function requireNonEmptyString(value, field, subject) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${subject} requires a non-empty ${field}`);
  }
  return value;
}

export function validateDataEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new Error('Data notice entry must be an object');
  }
  for (const field of REQUIRED_DATA_FIELDS) {
    requireNonEmptyString(entry[field], field, 'Data notice entry');
  }
  if ('changes' in entry) {
    requireNonEmptyString(entry.changes, 'changes', `Data notice entry ${entry.name}`);
  }
  return Object.fromEntries(
    [...REQUIRED_DATA_FIELDS, 'changes']
      .filter((field) => field in entry)
      .map((field) => [field, entry[field]]),
  );
}

function softwareEntry(name, packageRecord) {
  const subject = `Application dependency ${name}`;
  return {
    name,
    version: requireNonEmptyString(packageRecord?.version, 'version', subject),
    license: requireNonEmptyString(packageRecord?.license, 'license', subject),
    source: requireNonEmptyString(packageRecord?.resolved, 'source', subject),
    attribution: `Package: ${name}`,
  };
}

function byName(left, right) {
  return left.name.localeCompare(right.name, 'en');
}

function rejectDuplicateNames(entries, category) {
  const seen = new Set();
  for (const entry of entries) {
    if (seen.has(entry.name)) {
      throw new Error(`Duplicate ${category} notice name: ${entry.name}`);
    }
    seen.add(entry.name);
  }
}

export function buildThirdPartyNotices(packageLock, dataEntries) {
  const rootPackage = packageLock?.packages?.[''];
  if (!rootPackage || !rootPackage.dependencies) {
    throw new Error('package-lock.json is missing root application dependencies');
  }
  if (!Array.isArray(dataEntries)) {
    throw new Error('Third-party data configuration must be an array');
  }

  const software = Object.keys(rootPackage.dependencies)
    .map((name) => softwareEntry(name, packageLock.packages[`node_modules/${name}`]))
    .sort(byName);
  const data = dataEntries.map(validateDataEntry);
  rejectDuplicateNames(data, 'data');
  data.sort(byName);

  return {
    generatedFrom: {
      data: 'config/third-party-data.json',
      software: 'package-lock.json#packages[""].dependencies',
    },
    software,
    data,
  };
}

export async function writeThirdPartyNotices({ packageLockPath, dataPath, outputPath }) {
  const [packageLockText, dataText] = await Promise.all([
    readFile(packageLockPath, 'utf8'),
    readFile(dataPath, 'utf8'),
  ]);
  const notices = buildThirdPartyNotices(JSON.parse(packageLockText), JSON.parse(dataText));
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(notices, null, 2)}\n`);
  return notices;
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const root = resolve(dirname(scriptPath), '..');
  await writeThirdPartyNotices({
    packageLockPath: resolve(root, 'package-lock.json'),
    dataPath: resolve(root, 'config/third-party-data.json'),
    outputPath: resolve(root, 'public/data/licenses/project-third-party-notices.json'),
  });
}
