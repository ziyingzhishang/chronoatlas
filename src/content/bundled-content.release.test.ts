import { expect, test } from 'vitest';
import { bundledReleaseManifest } from './bundled-content';

test('bundled world release starts the first CE slice at year 1', () => {
  const firstCe = bundledReleaseManifest.packages.find((releasePackage) => (
    releasePackage.kind === 'world'
    && releasePackage.yearRange?.[0] === 1
    && releasePackage.yearRange?.[1] === 99
  ));

  expect(bundledReleaseManifest.packages.some((releasePackage) => (
    releasePackage.kind === 'world' && releasePackage.yearRange.includes(0)
  ))).toBe(false);
  expect(firstCe).toMatchObject({
    id: 'world-ce-1',
    files: [{ uri: 'data/world/1.json', collection: 'world-1' }],
  });
});

test('bundled release declares hash-verified world slices for active-release loading', () => {
  const world = bundledReleaseManifest.packages.find((releasePackage) => (
    releasePackage.kind === 'world'
    && releasePackage.yearRange?.[0] === 800
    && releasePackage.yearRange?.[1] === 899
  ));

  expect(world?.files).toHaveLength(1);
  expect(world?.files[0].uri).toBe('data/world/800.json');
  expect(world?.files[0].sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(world?.files[0].bytes).toBeGreaterThan(0);
});
