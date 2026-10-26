import { describe, expect, it } from 'vitest';
import generatedSchema from './release-schema.generated';
import runtimeSchema from './release-schema.json';
import { validateReleaseManifest } from './release-validation';

const digest = 'a'.repeat(64);

function validManifest() {
  return {
    releaseId: 'release-2026-10-26',
    schemaVersion: '1.0.0',
    minimumAppVersion: '0.1.0',
    createdAt: '2026-10-26T08:00:00.000Z',
    channel: 'preview',
    complianceProfile: 'internal-research',
    packages: [{
      id: 'core-zh',
      kind: 'content',
      region: 'china',
      yearRange: [-2070, 2026],
      required: true,
      dependencies: [],
      compressedBytes: 128,
      recordCount: 2,
      licenseIds: ['project-content'],
      files: [{
        uri: 'packages/core-zh/entities.a1b2c3.json',
        mediaType: 'application/json',
        sha256: digest,
        bytes: 256,
        collection: 'entities',
        sourceDigest: digest,
      }],
    }],
  } as const;
}

describe('validateReleaseManifest', () => {
  it('keeps the schema-derived TypeScript mirror equal to the authoritative JSON schema', () => {
    expect(generatedSchema).toEqual(runtimeSchema);
  });

  it('returns a valid immutable release manifest', () => {
    const manifest = validManifest();

    expect(validateReleaseManifest(manifest)).toEqual(manifest);
  });

  it('rejects an empty release identity', () => {
    expect(() => validateReleaseManifest({ ...validManifest(), releaseId: '' }))
      .toThrow(/releaseId/i);
  });

  it('rejects civil year zero in a package range', () => {
    const manifest = validManifest();
    const packages = [{ ...manifest.packages[0], yearRange: [-1, 0] }];

    expect(() => validateReleaseManifest({ ...manifest, packages }))
      .toThrow(/year 0/i);
  });

  it('rejects duplicate package identities', () => {
    const manifest = validManifest();

    expect(() => validateReleaseManifest({
      ...manifest,
      packages: [manifest.packages[0], { ...manifest.packages[0] }],
    })).toThrow(/duplicate package id.*core-zh/i);
  });

  it.each([
    '/packages/core.json',
    '../private/research.json',
    'https://example.test/core.json',
    'packages/%2e%2e/private.json',
    String.raw`packages\core.json`,
  ])('rejects unsafe release file URI %s', (uri) => {
    const manifest = validManifest();
    const files = [{ ...manifest.packages[0].files[0], uri }];

    expect(() => validateReleaseManifest({
      ...manifest,
      packages: [{ ...manifest.packages[0], files }],
    })).toThrow(/uri/i);
  });

  it('rejects malformed content hashes', () => {
    const manifest = validManifest();
    const files = [{ ...manifest.packages[0].files[0], sha256: 'bad' }];

    expect(() => validateReleaseManifest({
      ...manifest,
      packages: [{ ...manifest.packages[0], files }],
    })).toThrow(/sha256/i);
  });

  it('rejects packages without a declared license', () => {
    const manifest = validManifest();

    expect(() => validateReleaseManifest({
      ...manifest,
      packages: [{ ...manifest.packages[0], licenseIds: [] }],
    })).toThrow(/licenseIds/i);
  });

  it('rejects whitespace-only license identifiers', () => {
    const manifest = validManifest();

    expect(() => validateReleaseManifest({
      ...manifest,
      packages: [{ ...manifest.packages[0], licenseIds: ['   '] }],
    })).toThrow(/licenseIds/i);
  });

  it('rejects dependencies that are absent from the release', () => {
    const manifest = validManifest();

    expect(() => validateReleaseManifest({
      ...manifest,
      packages: [{ ...manifest.packages[0], dependencies: ['china-territory'] }],
    })).toThrow(/missing dependency.*china-territory/i);
  });

  it('rejects dependency cycles between release packages', () => {
    const manifest = validManifest();
    const territoryPackage = {
      ...manifest.packages[0],
      id: 'china-territory',
      kind: 'territory',
      dependencies: ['core-zh'],
      files: [{
        ...manifest.packages[0].files[0],
        uri: 'packages/china-territory/boundaries.a1b2c3.json',
      }],
    };

    expect(() => validateReleaseManifest({
      ...manifest,
      packages: [
        { ...manifest.packages[0], dependencies: ['china-territory'] },
        territoryPackage,
      ],
    })).toThrow(/dependency cycle/i);
  });

  it('rejects deeply encoded traversal and encoded control characters in file URIs', () => {
    const manifest = validManifest();
    let encodedTraversal = '%2e%2e%2fprivate.json';
    for (let pass = 0; pass < 9; pass += 1) encodedTraversal = encodedTraversal.replaceAll('%', '%25');

    for (const uri of [encodedTraversal, 'packages/file%0a.json']) {
      expect(() => validateReleaseManifest({
        ...manifest,
        packages: [{
          ...manifest.packages[0],
          files: [{ ...manifest.packages[0].files[0], uri }],
        }],
      })).toThrow(/uri/i);
    }
  });

  it('rejects invalid release timestamps', () => {
    for (const createdAt of [
      'not-a-date',
      '2026-02-30T00:00:00Z',
      '2026-01-01T24:00:00Z',
    ]) {
      expect(() => validateReleaseManifest({ ...validManifest(), createdAt }))
        .toThrow(/createdAt/i);
    }
  });

  it('rejects duplicate file URIs inside one package', () => {
    const manifest = validManifest();
    const duplicate = { ...manifest.packages[0].files[0] };

    expect(() => validateReleaseManifest({
      ...manifest,
      packages: [{ ...manifest.packages[0], files: [duplicate, duplicate] }],
    })).toThrow(/duplicate file uri/i);
  });

  it('rejects differently encoded file URIs that resolve to the same resource', () => {
    const manifest = validManifest();
    const direct = { ...manifest.packages[0].files[0], uri: 'packages/core/a.json' };
    const encoded = { ...manifest.packages[0].files[0], uri: 'packages/core/%61.json' };

    expect(() => validateReleaseManifest({
      ...manifest,
      packages: [{ ...manifest.packages[0], files: [direct, encoded] }],
    })).toThrow(/duplicate file uri/i);
  });

  it('rejects unsupported compliance profiles', () => {
    expect(() => validateReleaseManifest({
      ...validManifest(),
      complianceProfile: 'unreviewed-public',
    })).toThrow(/complianceProfile/i);
  });
});
