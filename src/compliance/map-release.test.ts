import { expect, test } from 'vitest';
import { evaluateMapRelease, type MapReleaseCompliance } from './map-release';

const researchOnly: MapReleaseCompliance = {
  status:'research-only', reviewNumber:null, reviewExpiresAt:null,
  checkedSources:[], requiredNotices:[],
};

test('blocks public release without a review number', () => {
  expect(evaluateMapRelease(researchOnly, new Date('2026-10-20'))).toContain('map review number is required');
});

test('accepts only a complete, unexpired public-release manifest', () => {
  const approved: MapReleaseCompliance = {
    status:'approved-for-public-release', reviewNumber:'GS(2026)0001号', reviewExpiresAt:'2027-10-20',
    checkedSources:[{id:'modern-reference',license:'public domain',attribution:'Natural Earth'}],
    requiredNotices:['review number displayed'],
  };
  expect(evaluateMapRelease(approved, new Date('2026-10-20'))).toEqual([]);
  expect(evaluateMapRelease({...approved, reviewExpiresAt:'2026-10-19'}, new Date('2026-10-20'))).toContain('map review approval is expired');
});
