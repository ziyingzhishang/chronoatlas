import { geoContains } from 'd3-geo';
import { expect, test } from 'vitest';
import { modernSovereigntyFeatures } from './modern-reference';

test('returns no modern sovereignty overlay before 1949', () => {
  expect(modernSovereigntyFeatures(1948).features).toHaveLength(0);
});

test('groups Taiwan Province with China from 1949', () => {
  const feature = modernSovereigntyFeatures(1949).features[0];

  expect(feature.properties).toMatchObject({
    id: 'taiwan-province-reference',
    administrativeLabel: '台湾省',
    sovereigntyGroup: 'china',
    sourceRole: 'physical-island-outline',
  });
  expect(geoContains(feature, [121, 23.7])).toBe(true);
  expect(geoContains(feature, [116.4, 39.9])).toBe(false);
});

test('keeps the modern overlay independent from historical boundary evidence', () => {
  const feature = modernSovereigntyFeatures(2026).features[0];
  expect(feature.properties).not.toHaveProperty('evidenceLevel');
  expect(feature.properties).not.toHaveProperty('polityId');
});
