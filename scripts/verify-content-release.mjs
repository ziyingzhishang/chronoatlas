import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import Ajv from 'ajv';

const schema = JSON.parse(await readFile(new URL('../src/content/release-schema.json', import.meta.url), 'utf8'));
const validateSchema = new Ajv({ allErrors: true, strict: true }).compile(schema);
const DEFAULT_LICENSE_IDS = new Set(['MIT', 'CC-BY-4.0', 'GPL-3.0', 'Public-Domain', 'Apache-2.0']);

export async function verifyContentRelease(manifestPath, options = {}) {
  const absoluteManifest = path.resolve(manifestPath);
  const manifest = JSON.parse(await readFile(absoluteManifest, 'utf8'));
  if (!validateSchema(manifest)) {
    throw new Error(`Invalid release manifest: ${validateSchema.errors?.map((item) => `${item.instancePath} ${item.message}`).join('; ')}`);
  }
  const publicRoot = path.resolve(path.dirname(absoluteManifest), '..', '..');
  const allowedLicenseIds = new Set(options.allowedLicenseIds ?? DEFAULT_LICENSE_IDS);
  const sources = new Set();
  const sourceReferences = [];
  const violations = [];
  let files = 0;

  validateDependencyGraph(manifest.packages, violations);

  for (const releasePackage of manifest.packages) {
    for (const licenseId of releasePackage.licenseIds) {
      if (!allowedLicenseIds.has(licenseId)) violations.push(`Unknown license id ${licenseId} in ${releasePackage.id}`);
    }
    let packageBytes = 0;
    let packageRecords = 0;
    for (const file of releasePackage.files) {
      files += 1;
      const target = await safePublicPath(publicRoot, file.uri);
      const bytes = await readFile(target).catch((error) => {
        violations.push(`Missing file ${file.uri}: ${error.message}`);
        return undefined;
      });
      if (!bytes) continue;
      packageBytes += bytes.byteLength;
      const digest = createHash('sha256').update(bytes).digest('hex');
      if (digest !== file.sha256) violations.push(`SHA-256 hash mismatch for ${file.uri}`);
      if (bytes.byteLength !== file.bytes) violations.push(`Byte size mismatch for ${file.uri}`);
      let value;
      try { value = JSON.parse(bytes.toString('utf8')); } catch { violations.push(`Invalid JSON in ${file.uri}`); continue; }
      packageRecords += recordCount(value, file.collection);
      collectSourceReferences(value, sourceReferences);
      if (file.collection === 'core-zh') {
        for (const source of value.sources ?? []) if (source?.id) sources.add(source.id);
      }
      if (file.collection === 'china-territory') validateLeaveUnfilled(value, violations);
    }
    if (packageBytes !== releasePackage.compressedBytes) {
      violations.push(`Package ${releasePackage.id} byte total mismatch`);
    }
    if (packageRecords !== releasePackage.recordCount) {
      violations.push(`Package ${releasePackage.id} record count mismatch: expected ${releasePackage.recordCount}, got ${packageRecords}`);
    }
  }

  for (const sourceId of sourceReferences) {
    if (!sources.has(sourceId)) violations.push(`Unknown source reference: ${sourceId}`);
  }
  if (violations.length) throw new Error(`Content release verification failed:\n- ${violations.join('\n- ')}`);
  return { releaseId: manifest.releaseId, files };
}

async function safePublicPath(publicRoot, uri) {
  if (hasUnsafeUriSyntax(uri)) {
    throw new Error(`Unsafe release file URI: ${uri}`);
  }

  let decoded = uri;
  try {
    while (true) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
  } catch {
    throw new Error(`Unsafe release file URI: ${uri}`);
  }

  decoded = decoded.normalize('NFC');
  if (hasUnsafeUriSyntax(decoded)) throw new Error(`Unsafe release file URI: ${uri}`);
  const segments = decoded.split('/');
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) throw new Error(`Unsafe release file URI: ${uri}`);
  const target = path.resolve(publicRoot, ...segments);
  if (target !== publicRoot && !target.startsWith(`${publicRoot}${path.sep}`)) throw new Error(`Release file escapes public root: ${uri}`);

  // Existing files must resolve beneath the public root even if an attacker
  // replaces one of the path segments with a symbolic link.
  try {
    const [realRoot, realTarget] = await Promise.all([realpath(publicRoot), realpath(target)]);
    if (realTarget !== realRoot && !realTarget.startsWith(`${realRoot}${path.sep}`)) {
      throw new Error(`Release file escapes public root through a symbolic link: ${uri}`);
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  return target;
}

function hasUnsafeUriSyntax(uri) {
  return !uri
    || uri.startsWith('/')
    || uri.includes('\\')
    || /[\u0000-\u001f\u007f?#]/.test(uri)
    || /^[a-z][a-z\d+.-]*:/i.test(uri);
}

function validateDependencyGraph(packages, violations) {
  const packagesById = new Map();
  for (const releasePackage of packages) {
    if (packagesById.has(releasePackage.id)) violations.push(`Duplicate package id ${releasePackage.id}`);
    packagesById.set(releasePackage.id, releasePackage);
  }
  for (const releasePackage of packages) {
    for (const dependencyId of releasePackage.dependencies) {
      if (dependencyId === releasePackage.id) violations.push(`Package ${releasePackage.id} cannot depend on itself`);
      else if (!packagesById.has(dependencyId)) violations.push(`Package ${releasePackage.id} has missing dependency ${dependencyId}`);
    }
  }

  const visiting = new Set();
  const visited = new Set();
  const visit = (packageId, trail) => {
    if (visiting.has(packageId)) {
      violations.push(`Package dependency cycle: ${[...trail, packageId].join(' -> ')}`);
      return;
    }
    if (visited.has(packageId)) return;
    visiting.add(packageId);
    for (const dependencyId of packagesById.get(packageId)?.dependencies ?? []) {
      if (packagesById.has(dependencyId)) visit(dependencyId, [...trail, packageId]);
    }
    visiting.delete(packageId);
    visited.add(packageId);
  };
  for (const packageId of packagesById.keys()) visit(packageId, []);
}

function recordCount(value, collection) {
  if (collection === 'core-zh' || collection === 'china-territory') {
    return Object.values(value).reduce((count, records) => count + (Array.isArray(records) ? records.length : 0), 0);
  }
  return Array.isArray(value.records) ? value.records.length : 0;
}

function collectSourceReferences(value, output) {
  if (Array.isArray(value)) { for (const item of value) collectSourceReferences(item, output); return; }
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value.sourceIds)) output.push(...value.sourceIds);
  for (const [key, nested] of Object.entries(value)) {
    if (key !== 'sources') collectSourceReferences(nested, output);
  }
}

function validateLeaveUnfilled(value, violations) {
  const geometryIds = new Set((value.boundaries ?? []).map((boundary) => boundary.id));
  for (const conclusion of value.coverageConclusions ?? []) {
    if (conclusion.representation === 'leave-unfilled' && (conclusion.geometryIds?.length ?? 0) > 0) {
      violations.push(`leave-unfilled conclusion ${conclusion.polityId}:${conclusion.from}:${conclusion.to} must not reference geometry`);
    }
    for (const geometryId of conclusion.geometryIds ?? []) {
      if (!geometryIds.has(geometryId)) violations.push(`Unknown geometry reference ${geometryId}`);
    }
  }
}

async function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) throw new Error('Usage: verify-content-release <manifest.json>');
  const result = await verifyContentRelease(manifestPath);
  console.log(`Verified content release ${result.releaseId}: ${result.files} files`);
}

if (path.basename(process.argv[1] ?? '') === 'verify-content-release.mjs') await main();
