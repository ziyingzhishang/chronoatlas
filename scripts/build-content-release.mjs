import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const FORBIDDEN_PUBLIC_KEYS = new Set([
  'audit', 'coverageAudit', 'derivation', 'evidenceLevel', 'geometrySourceId',
  'internalNotes', 'rawCoordinates', 'reviewStatus', 'territoryResearchTasks', 'vertexCount',
]);

const VERDICT_REPRESENTATION = {
  'direct-record-added': 'direct-boundary',
  'licensed-digitization-added': 'direct-boundary',
  'cultural-core': 'cultural-core',
  'control-centers': 'control-centers',
  'leave-unfilled': 'leave-unfilled',
  'maximum-record': 'direct-boundary',
  'nearest-same-polity': 'direct-boundary',
};

export async function buildContentRelease({ publicRoot, releaseId, profile, createdAt, authoring }) {
  if (!publicRoot || !releaseId || !profile || !createdAt || !authoring) {
    throw new Error('publicRoot, releaseId, profile, createdAt and authoring are required');
  }
  validateReleaseId(releaseId);

  const releasesRoot = path.join(publicRoot, 'releases');
  const finalDirectory = path.join(releasesRoot, releaseId);
  const temporaryDirectory = path.join(releasesRoot, `.${releaseId}.tmp-${process.pid}`);
  await mkdir(releasesRoot, { recursive: true });
  await rm(temporaryDirectory, { recursive: true, force: true });
  await mkdir(temporaryDirectory, { recursive: true });

  try {
    const core = normalizeCollections(authoring.coreCollections ?? {});
    const territory = buildTerritory(authoring.territory ?? {});
    const coreFile = await writeReleaseFile({
      publicRoot, temporaryDirectory, releaseId, filename: 'core-zh.json',
      collection: 'core-zh', value: core,
    });
    const territoryFile = await writeReleaseFile({
      publicRoot, temporaryDirectory, releaseId, filename: 'china-territory.json',
      collection: 'china-territory', value: territory,
    });

    const worldPackages = [];
    for (const chunk of [...(authoring.worldChunks ?? [])].sort((a, b) => a.start - b.start)) {
      const uri = `data/world/${chunk.filename}`;
      const absolutePath = path.join(publicRoot, ...uri.split('/'));
      const bytes = await readFile(absolutePath);
      const sha256 = hash(bytes);
      const parsed = JSON.parse(bytes.toString('utf8'));
      const recordCount = Array.isArray(parsed.records) ? parsed.records.length : chunk.records;
      worldPackages.push({
        id: `world-${yearToken(chunk.start)}`,
        kind: 'world', region: 'world', yearRange: [chunk.start, chunk.end], required: false,
        dependencies: ['core-zh'], compressedBytes: bytes.byteLength,
        recordCount, licenseIds: ['CC-BY-4.0'],
        files: [{
          uri, mediaType: 'application/json', sha256, bytes: bytes.byteLength,
          collection: `world-${chunk.start}`, sourceDigest: chunk.sha256 ?? sha256,
        }],
      });
    }

    const manifest = {
      releaseId, schemaVersion: '1', minimumAppVersion: '0.1.0', createdAt,
      channel: 'preview', complianceProfile: profile,
      packages: [
        packageFor('core-zh', 'content', true, [], ['MIT'], coreFile, countRecords(core)),
        packageFor(
          'china-territory', 'territory', true, ['core-zh'],
          ['MIT', 'CC-BY-4.0', 'GPL-3.0'], territoryFile, countRecords(territory),
          { region: 'china', yearRange: territoryYearRange(territory) },
        ),
        ...worldPackages,
      ],
    };
    const manifestText = serialize(manifest);
    await writeFile(path.join(temporaryDirectory, 'manifest.json'), manifestText);

    if (await exists(finalDirectory)) {
      const existing = await readFile(path.join(finalDirectory, 'manifest.json'), 'utf8').catch(() => '');
      if (existing !== manifestText) throw new Error(`Immutable release ${releaseId} already exists with different content`);
      await verifyExistingReleaseFiles(publicRoot, manifest);
      await rm(temporaryDirectory, { recursive: true, force: true });
    } else {
      await rename(temporaryDirectory, finalDirectory);
    }

    return { manifest, manifestPath: path.join(finalDirectory, 'manifest.json') };
  } catch (error) {
    await rm(temporaryDirectory, { recursive: true, force: true });
    throw error;
  }
}

function validateReleaseId(releaseId) {
  if (!/^[a-z0-9](?:[a-z0-9._-]{0,126}[a-z0-9])?$/i.test(releaseId)) {
    throw new Error(`releaseId must be a safe path segment: ${releaseId}`);
  }
}

async function verifyExistingReleaseFiles(publicRoot, manifest) {
  for (const releasePackage of manifest.packages) {
    for (const file of releasePackage.files) {
      const expectedPrefix = `releases/${manifest.releaseId}/`;
      if (!file.uri.startsWith(expectedPrefix)) {
        // Referenced world chunks are immutable inputs, not files owned by the release directory.
        continue;
      }
      const target = path.join(publicRoot, ...file.uri.split('/'));
      const bytes = await readFile(target).catch(() => undefined);
      if (!bytes || bytes.byteLength !== file.bytes || hash(bytes) !== file.sha256) {
        throw new Error(`Immutable release ${manifest.releaseId} was tampered with: ${file.uri}`);
      }
    }
  }
}

function normalizeCollections(collections) {
  return Object.fromEntries(Object.entries(collections)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, records]) => [name, sanitizeAndSort(records)]));
}

function buildTerritory(territory) {
  const boundaries = sanitizeAndSort(territory.boundaries ?? []);
  const coverageConclusions = [...(territory.coverageDecisions ?? [])]
    .sort((a, b) => a.polityId.localeCompare(b.polityId) || a.from - b.from || a.to - b.to)
    .map((decision) => {
      const representation = VERDICT_REPRESENTATION[decision.verdict];
      if (!representation) throw new Error(`Unsupported coverage verdict: ${decision.verdict}`);
      const conclusion = {
        polityId: decision.polityId, from: decision.from, to: decision.to, representation,
        sourceIds: [...new Set(decision.citationIds ?? [])].sort(),
      };
      if (representation !== 'leave-unfilled' && decision.sourceBoundaryIds?.length) {
        conclusion.geometryIds = [...new Set(decision.sourceBoundaryIds)].sort();
      }
      return conclusion;
    });
  return { boundaries, coverageConclusions };
}

function sanitizeAndSort(value) {
  if (Array.isArray(value)) {
    const items = value.map(sanitizeAndSort);
    return items.every((item) => item && typeof item === 'object' && typeof item.id === 'string')
      ? items.sort((a, b) => a.id.localeCompare(b.id))
      : items;
  }
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !FORBIDDEN_PUBLIC_KEYS.has(key))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => [key, sanitizeAndSort(nested)]));
}

async function writeReleaseFile({ publicRoot, temporaryDirectory, releaseId, filename, collection, value }) {
  const text = serialize(value);
  const bytes = Buffer.from(text);
  await writeFile(path.join(temporaryDirectory, filename), bytes);
  return {
    uri: `releases/${releaseId}/${filename}`, mediaType: 'application/json',
    sha256: hash(bytes), bytes: bytes.byteLength, collection, sourceDigest: hash(bytes),
  };
}

function packageFor(id, kind, required, dependencies, licenseIds, file, recordCount, extras = {}) {
  return {
    id, kind, ...extras, required, dependencies, compressedBytes: file.bytes,
    recordCount, licenseIds, files: [file],
  };
}

function countRecords(value) {
  return Object.values(value).reduce((count, records) => count + (Array.isArray(records) ? records.length : 0), 0);
}

function territoryYearRange(territory) {
  const years = [];
  for (const boundary of territory.boundaries) {
    for (const year of [boundary.validFrom, boundary.validTo, boundary.snapshotYear]) {
      if (Number.isInteger(year) && year !== 0) years.push(year);
    }
  }
  for (const conclusion of territory.coverageConclusions) years.push(conclusion.from, conclusion.to);
  if (!years.length) return [-1, 1];
  return [Math.min(...years), Math.max(...years)];
}

function serialize(value) {
  return `${JSON.stringify(value)}\n`;
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function yearToken(year) {
  return year < 0 ? `bce-${Math.abs(year)}` : `ce-${year}`;
}

async function exists(target) {
  try { await access(target); return true; } catch { return false; }
}

function parseCliArgs(argv) {
  const releaseIndex = argv.indexOf('--release');
  const profileIndex = argv.indexOf('--profile');
  if (releaseIndex < 0 || !argv[releaseIndex + 1] || profileIndex < 0 || !argv[profileIndex + 1]) {
    throw new Error('Usage: build-content-release --release <id> --profile <profile>');
  }
  return { releaseId: argv[releaseIndex + 1], profile: argv[profileIndex + 1] };
}

function deterministicCreatedAt() {
  if (process.env.SOURCE_DATE_EPOCH) return new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString();
  return execFileSync('git', ['show', '-s', '--format=%cI', 'HEAD'], { encoding: 'utf8' }).trim();
}

async function main() {
  const { releaseId, profile } = parseCliArgs(process.argv.slice(2));
  const { bundledAuthoringSnapshot } = await import('../src/content/bundled-adapter.ts');
  const publicRoot = path.resolve('public');
  const result = await buildContentRelease({
    publicRoot, releaseId, profile, createdAt: deterministicCreatedAt(),
    authoring: bundledAuthoringSnapshot,
  });
  console.log(`Built content release ${result.manifest.releaseId}: ${result.manifestPath}`);
}

if (path.basename(process.argv[1] ?? '') === 'build-content-release.mjs') {
  await main();
}
