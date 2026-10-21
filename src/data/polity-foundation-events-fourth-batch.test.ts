import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { auditPolityCoverage } from './polity-coverage';

const targets = [
  ['cheng_han', 'cheng-han-founded'],
  ['former_yan', 'former-yan-founded'],
  ['former_qin', 'former-qin-founded'],
  ['later_yan', 'later-yan-founded'],
  ['later_qin', 'later-qin-founded'],
  ['southern_yan', 'southern-yan-founded'],
  ['western_qin', 'western-qin-founded'],
  ['later_liang', 'later-liang-founded'],
  ['southern_tang', 'southern-tang-founded'],
  ['northern_yan', 'northern-yan-founded'],
] as const;

describe('fourth-batch polity foundation events', () => {
  it('adds one explicit formation event and detailed record for every selected uncovered polity', () => {
    for (const [polityId, eventId] of targets) {
      const event = events.find((candidate) => candidate.id === eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(event, `${eventId} event`).toBeDefined();
      expect(detail, `${eventId} detail`).toBeDefined();
      expect(detail?.polityIds).toContain(polityId);
      expect(event?.background).toBeTruthy();
      expect(event?.process).toBeTruthy();
      expect(event?.impact).toBeTruthy();
      expect(event?.mapNote).toBeTruthy();
      expect(event?.sourceIds.length).toBeGreaterThan(0);
      expect(event?.references?.length ?? 0).toBeGreaterThan(0);
      expect(detail?.phases?.length ?? 0).toBeGreaterThan(0);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote).toBeTruthy();
    }
  });

  it('raises establishment-event coverage for all ten selected polities', () => {
    const report = auditPolityCoverage();

    for (const [polityId] of targets) {
      expect(report.byPolity(polityId).hasEstablishmentNode, polityId).toBe(true);
    }
  });
});
