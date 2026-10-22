import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { polities } from './polities';
import { auditPolityCoverage } from './polity-coverage';
import { sourceNotes } from './sources';

const targets = [
  { polityId: 'han_warring', label: '韩', precision: 'approximate' },
  { polityId: 'zhao_warring', label: '赵', precision: 'approximate' },
  { polityId: 'wei_warring', label: '魏', precision: 'approximate' },
  { polityId: 'chu_warring', label: '楚', precision: 'approximate' },
  { polityId: 'yan_warring', label: '燕', precision: 'approximate' },
  { polityId: 'qi_warring', label: '齐', precision: 'approximate' },
  { polityId: 'xia', label: '夏（十六国）', precision: 'year' },
  { polityId: 'xia_early', label: '夏（约年）', precision: 'approximate' },
  { polityId: 'shang', label: '商', precision: 'approximate' },
  { polityId: 'zhou_western', label: '西周', precision: 'approximate' },
  { polityId: 'zhou_eastern', label: '东周王室', precision: 'approximate' },
  { polityId: 'qin_state', label: '秦国', precision: 'approximate' },
] as const;

describe('eighth-batch polity foundation events', () => {
  it('gives every audited gap its own unambiguous formation node', () => {
    const report = auditPolityCoverage();
    const eventIds = new Set<string>();

    for (const target of targets) {
      const coverage = report.byPolity(target.polityId);
      expect(coverage.hasEstablishmentNode, target.label).toBe(true);

      const eventId = coverage.establishmentEventIds.find((candidate) => candidate.endsWith('-eighth-batch'))!;
      expect(eventId, target.label).toBeDefined();
      expect(eventIds.has(eventId), `${target.label} reused another polity's node`).toBe(false);
      eventIds.add(eventId);

      const event = events.find((candidate) => candidate.id === eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      expect(event, target.label).toBeDefined();
      expect(detail, target.label).toBeDefined();
      expect(detail?.polityIds).toContain(target.polityId);
      expect(event?.title).toContain(target.label.split('（')[0]);
      expect(event?.datePrecision).toBe(target.precision);
      expect(event?.background).toBeTruthy();
      expect(event?.process).toBeTruthy();
      expect(event?.impact).toBeTruthy();
      expect(event?.mapNote).toBeTruthy();
      expect(detail?.causes.length).toBeGreaterThan(0);
      expect(detail?.consequences.length).toBeGreaterThan(0);
      expect(detail?.phases?.length).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote).toMatch(/形成|传统|约年|约前|口径|争议/);
      expect(event?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
    }
  });

  it('keeps the batch references resolvable and does not silently claim missing coverage', () => {
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const eventIds = new Set(events.map((event) => event.id));

    for (const target of targets) {
      const detail = eventDetails.find((candidate) =>
        candidate.polityIds.length === 1 && candidate.polityIds[0] === target.polityId && candidate.eventId.endsWith('-eighth-batch'),
      );
      expect(detail, target.label).toBeDefined();
      expect(detail?.polityIds.every((id) => polityIds.has(id))).toBe(true);
      expect(detail?.sourceIds.every((id) => sourceIds.has(id))).toBe(true);
      expect(detail?.relatedEventIds.every((id) => eventIds.has(id))).toBe(true);
    }
  });
});
