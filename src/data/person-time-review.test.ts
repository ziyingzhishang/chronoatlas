import { describe, expect, it } from 'vitest';
import type { HistoricalClaim, Person, PersonDetail } from '../domain/types';
import {
  buildPersonTimeCoverageReport,
  type PersonTimeReviewCatalog,
} from './person-time-review';

const fixturePerson: Person = {
  id: 'fixture-person',
  name: '测试人物',
  birthYear: 100,
  roles: ['君主'],
  description: '测试人物',
  sourceIds: ['fixture-source'],
};

const fixtureDetail: PersonDetail = {
  personId: 'fixture-person',
  biography: '测试人物详情',
  offices: [{
    title: '测试君主',
    validFrom: 120,
    validTo: 130,
    datePrecision: 'range',
    sourceIds: ['fixture-office-source'],
    uncertaintyNote: '任职区间，不代表完整生卒年。',
  }],
  aliases: [],
  keyEvents: [],
  sourceIds: ['fixture-detail-source'],
};

const fixtureClaim: HistoricalClaim = {
  id: 'fixture-claim',
  subjectId: 'fixture-person',
  predicate: 'participated-in',
  objectId: 'fixture-event',
  validFrom: 125,
  validTo: 125,
  datePrecision: 'year',
  perspective: 'person',
  evidenceType: 'explicit-record',
  confidence: 'high',
  sourceIds: ['fixture-claim-source'],
  uncertaintyNote: '事件参与时间，不代表完整生卒年。',
};

const fixtureCatalog: PersonTimeReviewCatalog = {
  people: [fixturePerson],
  personDetails: [fixtureDetail],
  claims: [fixtureClaim],
};

describe('person time review', () => {
  it('classifies complete life dates as confirmed and permits life-span placement', () => {
    const report = buildPersonTimeCoverageReport({
      people: [{
        ...fixturePerson,
        birthYear: 100,
        deathYear: 150,
      }],
      personDetails: [],
      claims: [],
    });
    const record = report.byPersonId['fixture-person'];

    expect(record.status).toBe('confirmed');
    expect(record.allowTimelinePosition).toBe(true);
    expect(record.evidence).toEqual(expect.arrayContaining([
      expect.objectContaining({ recordId: 'person:fixture-person:birth', from: 100 }),
      expect.objectContaining({ recordId: 'person:fixture-person:death', to: 150 }),
    ]));
  });

  it('keeps partial life dates and dated activity as approximate evidence windows', () => {
    const report = buildPersonTimeCoverageReport(fixtureCatalog);
    const record = report.byPersonId['fixture-person'];

    expect(record.status).toBe('approximate');
    expect(record.allowTimelinePosition).toBe(true);
    expect(record.birthYear).toBe(100);
    expect(record.deathYear).toBeUndefined();
    expect(record.evidence).toEqual(expect.arrayContaining([
      expect.objectContaining({ recordId: 'person:fixture-person:office:0', from: 120, to: 130 }),
      expect.objectContaining({ recordId: 'claim:fixture-claim', from: 125, to: 125 }),
    ]));
    expect(record.explanation).toContain('不将其扩展为完整生卒区间');
  });

  it('never promotes activity anchors to confirmed life dates', () => {
    const report = buildPersonTimeCoverageReport({
      people: [{ ...fixturePerson, birthYear: undefined, deathYear: undefined }],
      personDetails: [fixtureDetail],
      claims: [{ ...fixtureClaim, datePrecision: 'year' }],
    });
    const record = report.byPersonId['fixture-person'];

    expect(record.status).toBe('approximate');
    expect(record.evidence.some((item) => item.kind === 'office' && item.datePrecision === 'range')).toBe(true);
    expect(record.evidence.some((item) => item.kind === 'claim' && item.datePrecision === 'year')).toBe(true);
    expect(record.explanation).toContain('不将其扩展为完整生卒区间');
  });

  it('marks a person unknown when no source record carries a usable time value', () => {
    const report = buildPersonTimeCoverageReport({
      people: [{ ...fixturePerson, birthYear: undefined, deathYear: undefined }],
      personDetails: [{ ...fixtureDetail, offices: [{ ...fixtureDetail.offices[0], validFrom: undefined, validTo: undefined, datePrecision: 'unknown' }] }],
      claims: [{ ...fixtureClaim, validFrom: undefined, validTo: undefined, datePrecision: 'unknown' }],
    });
    const record = report.byPersonId['fixture-person'];

    expect(record.status).toBe('unknown');
    expect(record.allowTimelinePosition).toBe(false);
    expect(record.evidence).toEqual([]);
    expect(record.explanation).toContain('暂不定位');
  });

  it('audits all 46 currently uncertain people without inventing years', () => {
    const report = buildPersonTimeCoverageReport();
    const uncertain = report.records.filter((record) => record.status !== 'confirmed');

    expect(uncertain).toHaveLength(46);
    expect(report.totalPeople).toBeGreaterThan(41);
    expect(report.statusCounts.confirmed + report.statusCounts.approximate + report.statusCounts.unknown)
      .toBe(report.totalPeople);
    expect(report.uncertainPersonIds).toEqual(uncertain.map((record) => record.personId));
    expect(report.records.every((record) => record.evidence.every((evidence) => (
      evidence.from === undefined || evidence.to === undefined || evidence.from <= evidence.to
    )))).toBe(true);
    expect(uncertain.every((record) => (
      record.birthYear === undefined || record.deathYear === undefined
    ))).toBe(true);
    expect(uncertain
      .filter((record) => record.status === 'approximate')
      .every((record) => record.explanation.includes('不将其扩展为完整生卒区间'))).toBe(true);
    expect(report.byPersonId['yu-the-great'].explanation).toContain('传统文献');
  });
});
