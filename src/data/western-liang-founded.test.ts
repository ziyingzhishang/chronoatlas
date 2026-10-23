import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview, reviewEventTimeCoverage } from './event-time-review';
import { events } from './events';
import { getPolityDetail } from './polity-details';
import { places } from './places';
import { sourceById } from './sources';

describe('西凉建政节点闭环审计', () => {
  it('把400年确定为建政节点，并将397—399年受命与405年迁治分层', () => {
    const event = events.find((item) => item.id === 'western-liang-state-founded');
    const detail = eventDetails.find((item) => item.eventId === 'western-liang-state-founded');
    const review = eventTimeReview.find((item) => item.eventId === 'western-liang-state-founded');
    const reportRecord = reviewEventTimeCoverage().records.find((item) => item.eventId === 'western-liang-state-founded');

    expect(event).toMatchObject({
      year: 400,
      placeId: 'dunhuang',
      datePrecision: 'year',
      verification: 'checked',
    });
    expect(event?.sourceIds).toEqual(expect.arrayContaining([
      'jinshu-vol87-li-hao', 'zizhi-tongjian-vol111-western-liang',
    ]));
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '李暠受命与敦煌治理基础', startYear: 397, endYear: 399 }),
      expect.objectContaining({ label: '西凉建政与敦煌政治中心', startYear: 400, endYear: 404 }),
      expect.objectContaining({ label: '迁治酒泉', startYear: 405, endYear: 405 }),
      expect.objectContaining({ label: '酒泉政治中心', startYear: 405, endYear: 421 }),
    ]));
    expect(review).toMatchObject({ status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' });
    expect(reportRecord).toMatchObject({ datePrecision: 'year', status: 'confirmed' });
  });

  it('keeps the person claim and capital history aligned with the primary chronology', () => {
    const claim = claims.find((item) => item.id === 'claim-li-hao-participated-western-liang');
    const polity = getPolityDetail('western_liang');
    const westernCapitalTerms = capitalHistory.filter((term) => term.polityId === 'western_liang');

    expect(claim).toMatchObject({
      validFrom: 400,
      validTo: 400,
      datePrecision: 'year',
      evidenceType: 'explicit-record',
      confidence: 'high',
    });
    expect(claim?.sourceIds).toEqual(expect.arrayContaining([
      'jinshu-vol87-li-hao', 'zizhi-tongjian-vol111-western-liang',
    ]));
    expect(westernCapitalTerms).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'dunhuang', validFrom: 400, validTo: 404 }),
      expect.objectContaining({ placeId: 'jiuquan', validFrom: 405, validTo: 421 }),
    ]));
    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'dunhuang', validFrom: 400, validTo: 404 }),
      expect.objectContaining({ placeId: 'jiuquan', validFrom: 405, validTo: 421 }),
    ]));
    expect(places.find((place) => place.id === 'dunhuang')).toMatchObject({ modernName: '敦煌市' });
    expect(places.find((place) => place.id === 'jiuquan')).toMatchObject({ modernName: '酒泉市' });
  });

  it('resolves both primary source records', () => {
    expect(sourceById['jinshu-vol87-li-hao']).toMatchObject({
      title: '《晋书》卷八十七·凉武昭王李暠传',
    });
    expect(sourceById['zizhi-tongjian-vol111-western-liang']).toMatchObject({
      title: '《资治通鉴》卷一百十一·西凉形成',
    });
  });
});
