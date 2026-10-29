import { expect, test } from 'vitest';
import { bundledReleaseManifest } from './bundled-content';

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
