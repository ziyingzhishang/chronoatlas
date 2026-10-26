import Ajv from 'ajv';
import schema from './release-schema.json';
import type { ReleaseManifest } from './release-types';

const ajv = new Ajv({ allErrors: true, strict: true });
const validateSchema = ajv.compile(schema);

export function validateReleaseManifest(value: unknown): ReleaseManifest {
  if (!validateSchema(value)) {
    const details = validateSchema.errors
      ?.map((error) => `${error.instancePath || '/'} ${error.message ?? 'is invalid'}`)
      .join('; ');
    throw new Error(`Invalid release manifest: ${details ?? 'schema validation failed'}`);
  }

  validateReleaseRelationships(value as ReleaseManifest);
  return value as ReleaseManifest;
}

function validateReleaseRelationships(manifest: ReleaseManifest) {
  const packageIds = new Set<string>();
  const fileUris = new Set<string>();
  if (!isRfc3339Timestamp(manifest.createdAt)) {
    throw new Error(`Release createdAt must be an RFC 3339 timestamp: ${manifest.createdAt}`);
  }

  for (const releasePackage of manifest.packages) {
    if (packageIds.has(releasePackage.id)) {
      throw new Error(`Duplicate package id: ${releasePackage.id}`);
    }
    packageIds.add(releasePackage.id);

    if (releasePackage.yearRange) {
      const [from, to] = releasePackage.yearRange;
      if (from === 0 || to === 0) throw new Error(`Package ${releasePackage.id} year 0 is not a valid civil year`);
      if (from > to) throw new Error(`Package ${releasePackage.id} yearRange must be chronological`);
    }

    for (const file of releasePackage.files) {
      const normalizedUri = normalizeSafeRelativeUri(file.uri);
      if (!normalizedUri) {
        throw new Error(`Package ${releasePackage.id} file URI must be a safe relative path: ${file.uri}`);
      }
      if (fileUris.has(normalizedUri)) {
        throw new Error(`Duplicate file URI: ${file.uri}`);
      }
      fileUris.add(normalizedUri);
    }
  }

  for (const releasePackage of manifest.packages) {
    for (const dependencyId of releasePackage.dependencies) {
      if (dependencyId === releasePackage.id) {
        throw new Error(`Package ${releasePackage.id} cannot depend on itself`);
      }
      if (!packageIds.has(dependencyId)) {
        throw new Error(`Package ${releasePackage.id} has missing dependency: ${dependencyId}`);
      }
    }
  }

  rejectDependencyCycles(manifest);
}

function normalizeSafeRelativeUri(uri: string) {
  if (hasUnsafeUriSyntax(uri)) {
    return undefined;
  }

  let decoded = uri;
  try {
    while (true) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
  } catch {
    return undefined;
  }

  decoded = decoded.normalize('NFC');
  if (hasUnsafeUriSyntax(decoded)) return undefined;
  const segments = decoded.split('/');
  if (!segments.every((segment) => segment !== '' && segment !== '.' && segment !== '..')) return undefined;
  return decoded;
}

function hasUnsafeUriSyntax(uri: string) {
  return !uri
    || uri.startsWith('/')
    || uri.includes('\\')
    || /[\u0000-\u001f\u007f?#]/.test(uri)
    || /^[a-z][a-z\d+.-]*:/i.test(uri);
}

function rejectDependencyCycles(manifest: ReleaseManifest) {
  const packagesById = new Map(manifest.packages.map((releasePackage) => [releasePackage.id, releasePackage]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (packageId: string, path: string[]) => {
    if (visiting.has(packageId)) {
      const cycleStart = path.indexOf(packageId);
      const cycle = [...path.slice(cycleStart), packageId].join(' -> ');
      throw new Error(`Release package dependency cycle: ${cycle}`);
    }
    if (visited.has(packageId)) return;

    visiting.add(packageId);
    const releasePackage = packagesById.get(packageId);
    for (const dependencyId of releasePackage?.dependencies ?? []) {
      visit(dependencyId, [...path, packageId]);
    }
    visiting.delete(packageId);
    visited.add(packageId);
  };

  for (const packageId of packagesById.keys()) visit(packageId, []);
}

function isRfc3339Timestamp(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-](\d{2}):(\d{2}))$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour = match[9] === undefined ? 0 : Number(match[9]);
  const offsetMinute = match[10] === undefined ? 0 : Number(match[10]);
  if (year === 0 || month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59 || offsetHour > 23 || offsetMinute > 59) {
    return false;
  }

  const daysByMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysByMonth[month - 1];
}

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
