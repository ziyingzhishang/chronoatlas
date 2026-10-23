import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { auditPolityCoverage } from './polity-coverage';

const targets = [
  ['xin', 'xin-founded'],
  ['gengshi', 'gengshi-founded'],
  ['southern_liang', 'southern-liang-founded'],
  ['nanzhao', 'nanzhao-founded'],
  ['goguryeo', 'goguryeo-founded'],
  ['silla', 'silla-founded'],
  ['tuyuhun', 'tuyuhun-founded'],
  ['turkic', 'turkic-founded'],
  ['tibetan_empire', 'tibetan-founded'],
  ['prc', 'prc-founded'],
] as const;

describe('第七批政权建政事件', () => {
  it('只补齐动态审计仍缺少节点且本批选定的十个政权', () => {
    const report = auditPolityCoverage();

    for (const [polityId, eventId] of targets) {
      expect(report.byPolity(polityId), polityId).toMatchObject({
        hasEstablishmentNode: true,
      });
      expect(report.byPolity(polityId).establishmentEventIds).toContain(eventId);
      expect(events.filter((event) => event.id === eventId), eventId).toHaveLength(1);
      expect(eventDetails.filter((detail) => detail.eventId === eventId), eventId).toHaveLength(1);
      expect(eventDetails.find((detail) => detail.eventId === eventId)?.polityIds).toContain(polityId);
    }

    const remaining = report.polities
      .filter((item) => !item.hasEstablishmentNode)
      .map((item) => `${item.polityId}:${item.name}`);
    console.info('第七批完成后剩余建政节点缺口', remaining);
    expect(remaining).toEqual([]);
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
});
