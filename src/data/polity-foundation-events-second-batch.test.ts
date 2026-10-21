import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { auditPolityCoverage } from './polity-coverage';

const targets = [
  { polityId: 'wei_northern', eventId: 'northern-wei-founded' },
  { polityId: 'qi_southern', eventId: 'southern-qi-founded' },
  { polityId: 'chen_southern', eventId: 'southern-chen-founded' },
  { polityId: 'qi_northern', eventId: 'northern-qi-founded' },
  { polityId: 'khitan', eventId: 'liao-founded' },
  { polityId: 'former_shu', eventId: 'former-shu-founded' },
  { polityId: 'later_shu', eventId: 'later-shu-founded' },
  { polityId: 'northern_han', eventId: 'northern-han-founded' },
] as const;

describe('政权建政事件第二批', () => {
  it('为目标政权建立独立、可定位且带完整叙事字段的事件节点', () => {
    const eventById = new Map(events.map((event) => [event.id, event]));
    const detailById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    for (const target of targets) {
      const event = eventById.get(target.eventId);
      const detail = detailById.get(target.eventId);

      expect(event, target.eventId).toBeDefined();
      expect(detail, target.eventId).toBeDefined();
      expect(event).toMatchObject({
        category: '政权建立／更替',
        sourceIds: expect.arrayContaining(['zizhi-tongjian', 'china-chronology']),
      });
      expect(event?.background).toBeTruthy();
      expect(event?.process).toBeTruthy();
      expect(event?.impact).toBeTruthy();
      expect(event?.mapNote).toBeTruthy();
      expect(event?.references?.length).toBeGreaterThan(0);
      expect(detail).toMatchObject({
        polityIds: expect.arrayContaining([target.polityId]),
        causes: expect.any(Array),
        consequences: expect.any(Array),
        phases: expect.any(Array),
        sourceIds: expect.arrayContaining(['zizhi-tongjian', 'china-chronology']),
        uncertaintyNote: expect.any(String),
      });
      expect(detail?.phases?.length ?? 0).toBeGreaterThan(0);
      expect(detail?.causes?.length ?? 0).toBeGreaterThan(0);
      expect(detail?.consequences?.length ?? 0).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('使第二批目标政权全部获得建政与已核人物关系覆盖', () => {
    const report = auditPolityCoverage();

    for (const target of targets) {
      expect(report.byPolity(target.polityId)).toMatchObject({
        hasEstablishmentNode: true,
        establishmentEventIds: [target.eventId],
      });
    }

    expect(report.byPolity('wei_northern').gaps).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'missing-associated-person' }),
      expect.objectContaining({ code: 'missing-explicit-relationship' }),
    ]));
  });
});
