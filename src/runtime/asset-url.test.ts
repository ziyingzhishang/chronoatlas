import { describe, expect, test } from 'vitest';
import { publicAssetUrl } from './asset-url';

describe('publicAssetUrl', () => {
  test('resolves under a project Pages base', () => {
    expect(publicAssetUrl('data/world/-200.json', '/chronoatlas/')).toBe(
      '/chronoatlas/data/world/-200.json',
    );
    expect(publicAssetUrl('data/world/-200.json', '/chronoatlas')).toBe(
      '/chronoatlas/data/world/-200.json',
    );
  });

  test('resolves under a root or custom domain', () => {
    expect(publicAssetUrl('data/world/-200.json', '/')).toBe('/data/world/-200.json');
  });

  test('rejects absolute, traversal and protocol paths', () => {
    expect(() => publicAssetUrl('/data/world/0.json', '/chronoatlas/')).toThrow();
    expect(() => publicAssetUrl('../secret', '/chronoatlas/')).toThrow();
    expect(() => publicAssetUrl('https://example.com/data.json', '/')).toThrow();
    expect(() => publicAssetUrl('\\evil.example\\asset.json', '/')).toThrow();
    expect(() => publicAssetUrl('data/%2e%2e/secret.json', '/chronoatlas/')).toThrow();
  });
});
