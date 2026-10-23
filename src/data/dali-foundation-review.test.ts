import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { eventTimeReview, reviewEventTimeCoverage } from './event-time-review';
import { claims } from './claims';
import { places } from './places';
import { sourceById } from './sources';

const daliEvent = events.find((event) => event.id === 'dali-founded');
const daliDetail = eventDetails.find((detail) => detail.eventId === 'dali-founded');

describe('大理建政年代与城市史审计', () => {
  it('保留937约年并记录937/938两种建国口径', () => {
    const record = reviewEventTimeCoverage().records.find((item) => item.eventId === 'dali-founded');

    expect(daliEvent).toMatchObject({ year: 937, datePrecision: 'approximate', verification: 'partial' });
    expect(record).toMatchObject({
      year: 937,
      datePrecision: 'approximate',
      expectedPrecision: 'approximate',
      status: 'approximate',
      timelineStrategy: 'approximate-marker',
    });
    expect(record?.explanation).toContain('937');
    expect(record?.explanation).toContain('938');
    expect(record?.explanation).toContain('约年');
  });

  it('把羊苴咩城和高氏—段氏后续阶段与建政节点分层', () => {
    expect(daliDetail?.locationIds).toEqual(['dali_city', 'yangjumei']);
    expect(daliDetail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '羊苴咩城政治中心', startYear: 937, endYear: 950 }),
      expect.objectContaining({ label: '高氏大中国阶段', startYear: 1094, endYear: 1096 }),
      expect.objectContaining({ label: '段氏复位与高氏相国阶段', startYear: 1096, endYear: 1253 }),
    ]));
    expect(daliDetail?.consequences).toContain(
      '1094—1096年高升泰建立大中国，1096年段氏复位；复位后的段氏王权与高氏相国权力不能合并为937年的建政节点。',
    );
  });

  it('为年代争议、城市定位和段高关系保留可追溯来源', () => {
    const sourceIds = [
      'dali-diancai-record',
      'dali-history-research-nopss',
      'dali-duan-siping-official',
      'dali-yangjumei-mct',
      'dali-cambridge-governance',
    ];

    expect(daliEvent?.sourceIds).toEqual(expect.arrayContaining(sourceIds));
    expect(daliDetail?.sourceIds).toEqual(expect.arrayContaining(sourceIds));
    sourceIds.forEach((sourceId) => expect(sourceById[sourceId], sourceId).toBeDefined());
    expect(places.find((place) => place.id === 'yangjumei')?.sourceIds).toEqual(
      expect.arrayContaining(['dali-yangjumei-mct', 'dali-duan-siping-official']),
    );

    const participation = claims.find((claim) => claim.id === 'claim-duan-siping-participated-dali-founded');
    const rule = claims.find((claim) => claim.id === 'claim-duan-siping-ruled-dali-sixtyfirst');
    expect(participation).toMatchObject({ datePrecision: 'approximate', confidence: 'medium' });
    expect(rule).toMatchObject({ datePrecision: 'range', confidence: 'high' });
    expect(participation?.sourceIds).toEqual(expect.arrayContaining(['dali-diancai-record', 'dali-history-research-nopss']));
    expect(rule?.sourceIds).toEqual(expect.arrayContaining(['dali-history-research-nopss', 'dali-cambridge-governance']));
  });
});
