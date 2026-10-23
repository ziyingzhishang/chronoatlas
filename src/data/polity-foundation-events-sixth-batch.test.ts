import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { auditPolityCoverage } from './polity-coverage';

const targets = [
  ['western_liang', 'western-liang-state-founded'],
  ['western_liao', 'western-liao-founded'],
  ['dali', 'dali-founded'],
  ['mongol', 'mongol-founded'],
  ['northern_yuan', 'northern-yuan-founded'],
  ['later_jin', 'later-jin-founded'],
  ['ming_southern', 'southern-ming-founded'],
  ['xiongnu', 'xiongnu-founded'],
] as const;

describe('第六批政权建政事件', () => {
  it('只为动态审计仍缺少建政节点的目标政权新增唯一节点', () => {
    for (const [polityId, eventId] of targets) {
      expect(events.filter((event) => event.id === eventId), `${eventId} event count`).toHaveLength(1);
      expect(eventDetails.filter((detail) => detail.eventId === eventId), `${eventId} detail count`).toHaveLength(1);
      expect(eventDetails.find((detail) => detail.eventId === eventId)?.polityIds).toContain(polityId);
    }
  });

  it('每个节点包含完整叙事、阶段、来源和不确定性说明', () => {
    for (const [, eventId] of targets) {
      const event = events.find((candidate) => candidate.id === eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(event?.background, eventId).toBeTruthy();
      expect(event?.process, eventId).toBeTruthy();
      expect(event?.impact, eventId).toBeTruthy();
      expect(event?.mapNote, eventId).toBeTruthy();
      expect(event?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(event?.references?.length, eventId).toBeGreaterThan(0);
      expect(detail?.polityIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.causes.length, eventId).toBeGreaterThan(0);
      expect(detail?.consequences.length, eventId).toBeGreaterThan(0);
      expect(detail?.phases?.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote, eventId).toBeTruthy();
    }
  });

  it('使八个目标政权获得可复现的建政事件覆盖', () => {
    const report = auditPolityCoverage();

    for (const [polityId, eventId] of targets) {
      expect(report.byPolity(polityId), polityId).toMatchObject({
        hasEstablishmentNode: true,
      });
      if (polityId === 'ming_southern') {
        expect(report.byPolity(polityId)?.establishmentEventIds).toEqual(expect.arrayContaining([
          eventId,
          'hongguang-nanjing-founded',
          'longwu-fuzhou-founded',
          'shaowu-guangzhou-founded',
          'yongli-zhaoqing-founded',
        ]));
      } else {
        expect(report.byPolity(polityId)?.establishmentEventIds).toEqual([eventId]);
      }
    }
  });
});
