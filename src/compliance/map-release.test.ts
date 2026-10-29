import { expect, test } from 'vitest';
import { evaluateMapRelease, type MapReleaseCompliance } from './map-release';

const researchOnly: MapReleaseCompliance = {
  status:'research-only', reviewNumber:null, reviewExpiresAt:null,
  approvedReleaseId:null,
  approvedReleaseManifestSha256:null,
  checkedSources:[], requiredNotices:[],
};

test('blocks public release without a review number', () => {
  expect(evaluateMapRelease(researchOnly, new Date('2026-10-20'))).toContain('map review number is required');
});

test('accepts only a complete, unexpired public-release manifest', () => {
  const approved: MapReleaseCompliance = {
    status:'approved-for-public-release', reviewNumber:'GS(2026)0001号', reviewExpiresAt:'2027-10-20',
    approvedReleaseId:'release-a',
    approvedReleaseManifestSha256:'a'.repeat(64),
    checkedSources:[{id:'modern-reference',license:'public domain',attribution:'Natural Earth'}],
    requiredNotices:['review number displayed'],
  };
  expect(evaluateMapRelease(approved, new Date('2026-10-20'))).toEqual([]);
  expect(evaluateMapRelease({...approved, reviewExpiresAt:'2026-10-19'}, new Date('2026-10-20'))).toContain('map review approval is expired');
});

test.each([
  'not-a-date',
  '2027-02-29',
  '2027-13-01',
  '2027-01-01T00:00:00Z',
])('rejects an invalid map review expiry date: %s', (reviewExpiresAt) => {
  const approved: MapReleaseCompliance = {
    status:'approved-for-public-release', reviewNumber:'GS(2026)0001号', reviewExpiresAt,
    approvedReleaseId:'release-a',
    approvedReleaseManifestSha256:'a'.repeat(64),
    checkedSources:[{id:'modern-reference',license:'public domain',attribution:'Natural Earth'}],
    requiredNotices:['review number displayed'],
  };
  expect(evaluateMapRelease(approved, new Date('2026-10-20'))).toContain('map review expiry date is invalid');
});

test.each([
  'placeholder',
  'TBD',
  '待填',
  'GS 2026 0001',
])('rejects a placeholder or malformed map review number: %s', (reviewNumber) => {
  const approved: MapReleaseCompliance = {
    status:'approved-for-public-release', reviewNumber, reviewExpiresAt:'2027-10-20',
    approvedReleaseId:'release-a',
    approvedReleaseManifestSha256:'a'.repeat(64),
    checkedSources:[{id:'modern-reference',license:'public domain',attribution:'Natural Earth'}],
    requiredNotices:['review number displayed'],
  };
  expect(evaluateMapRelease(approved, new Date('2026-10-20'))).toContain('map review number is invalid');
});

test.each([
  [{id:'',license:'public domain',attribution:'Natural Earth'}, 'map source id is required'],
  [{id:'modern-reference',license:'',attribution:'Natural Earth'}, 'map source license is required'],
  [{id:'modern-reference',license:'public domain',attribution:'  '}, 'map source attribution is required'],
] as const)('rejects incomplete checked map source fields', (source, issue) => {
  const approved: MapReleaseCompliance = {
    status:'approved-for-public-release', reviewNumber:'GS(2026)0001号', reviewExpiresAt:'2027-10-20',
    approvedReleaseId:'release-a',
    approvedReleaseManifestSha256:'a'.repeat(64),
    checkedSources:[source], requiredNotices:['review number displayed'],
  };
  expect(evaluateMapRelease(approved, new Date('2026-10-20'))).toContain(issue);
});

test('rejects empty required publication notices', () => {
  const approved: MapReleaseCompliance = {
    status:'approved-for-public-release', reviewNumber:'GS(2026)0001号', reviewExpiresAt:'2027-10-20',
    approvedReleaseId:'release-a',
    approvedReleaseManifestSha256:'a'.repeat(64),
    checkedSources:[{id:'modern-reference',license:'public domain',attribution:'Natural Earth'}],
    requiredNotices:['  '],
  };
  expect(evaluateMapRelease(approved, new Date('2026-10-20'))).toContain('required publication notice must not be empty');
});

test('binds public approval to the exact release manifest digest', () => {
  const approved: MapReleaseCompliance = {
    status:'approved-for-public-release', reviewNumber:'GS(2026)0001号', reviewExpiresAt:'2027-10-20',
    approvedReleaseId:'release-a',
    approvedReleaseManifestSha256:'a'.repeat(64),
    checkedSources:[{id:'modern-reference',license:'public domain',attribution:'Natural Earth'}],
    requiredNotices:['review number displayed'],
  };
  expect(evaluateMapRelease(approved, new Date('2026-10-20'), 'b'.repeat(64)))
    .toContain('map approval does not match this release manifest');
  expect(evaluateMapRelease({...approved, approvedReleaseManifestSha256:null}, new Date('2026-10-20')))
    .toContain('approved release manifest digest is required');
});

test('binds public approval to the active release id', () => {
  const approved = {
    status:'approved-for-public-release', reviewNumber:'GS(2026)0001号', reviewExpiresAt:'2027-10-20',
    approvedReleaseId:'release-a', approvedReleaseManifestSha256:'a'.repeat(64),
    checkedSources:[{id:'modern-reference',license:'public domain',attribution:'Natural Earth'}],
    requiredNotices:['review number displayed'],
  } as MapReleaseCompliance & { approvedReleaseId: string };

  expect(evaluateMapRelease(approved, new Date('2026-10-20'), 'a'.repeat(64), 'release-b'))
    .toContain('map approval does not match this release id');
});
