import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { events } from './events';
import { people } from './people';
import { auditPolityCoverage } from './polity-coverage';
import { sourceById } from './sources';

const targets = [
  { eventId: 'changan-xin-founded', personId: 'wang-mang', year: 9, datePrecision: 'year', scope: '受禅建新' },
  { eventId: 'changan-later-qin', personId: 'yao-chang', year: 384, datePrecision: 'year', scope: '384年形成与386年前后据长安' },
  { eventId: 'tang-founded-changan', personId: 'li-yuan', year: 618, datePrecision: 'year', scope: '618年唐建国政治节点' },
] as const;

describe('政权建立事件详情参与端点闭合', () => {
  it('adds exactly the approved direct participant to each existing detail', () => {
    const eventById = new Map(events.map((event) => [event.id, event]));
    const detailById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
    const peopleById = new Map(people.map((person) => [person.id, person]));

    for (const target of targets) {
      const event = eventById.get(target.eventId);
      const detail = detailById.get(target.eventId);
      const participant = detail?.participants.find((candidate) => candidate.personId === target.personId);

      expect(event, target.eventId).toBeDefined();
      expect(event?.year, target.eventId).toBe(target.year);
      expect(event?.datePrecision, target.eventId).toBe(target.datePrecision);
      expect(detail?.participants, target.eventId).toHaveLength(1);
      expect(participant, target.eventId).toBeDefined();
      expect(participant?.relationType ?? 'direct', target.eventId).toBe('direct');
      expect(participant?.role, target.eventId).toContain(target.scope);
      expect(participant?.note, target.eventId).toBeTruthy();
      expect(peopleById.has(target.personId), target.eventId).toBe(true);

      const personSourceIds = new Set(peopleById.get(target.personId)?.sourceIds ?? []);
      expect((detail?.sourceIds ?? []).some((sourceId) => personSourceIds.has(sourceId)), target.eventId).toBe(true);
    }
  });

  it('keeps the three event-detail references closed and preserves review boundaries', () => {
    const report = buildEventDetailCoverageReport();
    const itemsById = new Map(report.items.map((item) => [item.eventId, item]));

    expect(report.unresolvedEventIds).toEqual([]);
    expect(itemsById.get('tang-founded-changan')?.status).toBe('covered');
    expect(itemsById.get('changan-xin-founded')?.status).toBe('needs-review');
    expect(itemsById.get('changan-later-qin')?.status).toBe('needs-review');

    for (const target of targets) {
      const item = itemsById.get(target.eventId);

      expect(item, target.eventId).toBeDefined();
      expect(item?.participantIds, target.eventId).toEqual([target.personId]);
      expect(item?.locationIds.length, target.eventId).toBeGreaterThan(0);
      expect(item?.polityIds.length, target.eventId).toBeGreaterThan(0);
      expect(item?.relatedEventIds.length, target.eventId).toBeGreaterThan(0);
      expect(item?.sourceComplete, target.eventId).toBe(true);
      expect(item?.unresolvedReferenceIds, target.eventId).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
      expect(item?.sourceIds.every((sourceId) => sourceById[sourceId]), target.eventId).toBe(true);
    }

    expect(auditPolityCoverage().establishmentCoverageRate).toBe(1);
  });
});
