import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { auditPolityCoverage } from './polity-coverage';

const targets = [
  ['jin_western', 'western-jin-founded'],
  ['song_southern', 'liu-song-founded'],
  ['northern_liang', 'northern-liang-founded'],
  ['tang_later', 'tang-later-founded'],
  ['wu_ten', 'yang-wu-founded'],
  ['wuyue', 'wuyue-founded'],
  ['min', 'min-founded'],
  ['southern_han', 'southern-han-founded'],
  ['chu_ten', 'ma-chu-founded'],
  ['jingnan', 'jingnan-founded'],
] as const;

describe('第五批政权建政事件', () => {
  it('为动态审计选出的十个缺口政权各提供唯一建政节点', () => {
    for (const [polityId, eventId] of targets) {
      const matches = events.filter((event) => event.id === eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(matches, `${eventId} event count`).toHaveLength(1);
      expect(detail, `${eventId} detail`).toBeDefined();
      expect(detail?.polityIds).toContain(polityId);
    }
  });

  it('每个建政节点都有完整叙事、阶段、来源和不确定性说明', () => {
    for (const [, eventId] of targets) {
      const event = events.find((candidate) => candidate.id === eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(event?.background, eventId).toBeTruthy();
      expect(event?.process, eventId).toBeTruthy();
      expect(event?.impact, eventId).toBeTruthy();
      expect(event?.mapNote, eventId).toBeTruthy();
      expect(event?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(event?.references?.length, eventId).toBeGreaterThan(0);
      expect(detail?.causes.length, eventId).toBeGreaterThan(0);
      expect(detail?.consequences.length, eventId).toBeGreaterThan(0);
      expect(detail?.phases?.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote, eventId).toBeTruthy();
    }
  });

  it('使十个目标政权获得可复现的建政事件覆盖', () => {
    const report = auditPolityCoverage();

    for (const [polityId, eventId] of targets) {
      expect(report.byPolity(polityId), polityId).toMatchObject({
        hasEstablishmentNode: true,
        establishmentEventIds: [eventId],
      });
    }
  });
});
