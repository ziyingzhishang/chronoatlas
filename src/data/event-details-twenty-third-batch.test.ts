import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';

const targetLocations = {
  'western-liang-state-founded': ['dunhuang', 'jiuquan'],
  'western-liao-founded': ['balasagun'],
  'dali-founded': ['dali_city'],
  'song-southward': ['kaifeng', 'yingtian', 'linan'],
  'northern-yuan-founded': ['beiyuan_core'],
  'southern-ming-founded': ['yingtian'],
  'qing-enters-pass': ['shengjing', 'beijing'],
  'republic-founded': ['jiankang'],
  'prc-founded': ['beijing'],
} as const;

describe('twenty-third-batch event location closure', () => {
  it('closes the selected Han-successor, Dali, Liang, Liao-Song, Qing and modern location gaps', () => {
    const report = auditKnowledgeCoverage();
    const missingLocationIds = new Set(
      report.tasks
        .filter((task) => task.taskKind === 'event-location-missing')
        .map((task) => task.entityId),
    );

    Object.keys(targetLocations).forEach((eventId) => {
      expect(missingLocationIds.has(eventId), eventId).toBe(false);
    });
  });

  it('keeps the Han imperial accession boundary explicit when no verified place entity exists', () => {
    const detail = eventDetails.find((candidate) => candidate.eventId === 'han-imperial-accession');
    const report = auditKnowledgeCoverage();

    expect(report.tasks.some((task) => (
      task.taskKind === 'event-location-missing' && task.entityId === 'han-imperial-accession'
    ))).toBe(true);
    expect(detail?.locationIds).toEqual([]);
    expect(detail?.uncertaintyNote).toContain('汜水之阳');
  });

  it('resolves every selected location, polity, event and source reference', () => {
    const eventIds = new Set(events.map((event) => event.id));
    const placeIds = new Set(places.map((place) => place.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    Object.entries(targetLocations).forEach(([eventId, expectedPlaceIds]) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(detail, eventId).toBeDefined();
      expect(detail?.locationIds, eventId).toEqual(expectedPlaceIds);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote, eventId).toBeTruthy();

      detail?.locationIds.forEach((placeId) => {
        expect(placeIds.has(placeId), `${eventId} -> ${placeId}`).toBe(true);
      });
      detail?.polityIds.forEach((polityId) => {
        expect(polityIds.has(polityId), `${eventId} -> ${polityId}`).toBe(true);
      });
      detail?.relatedEventIds.forEach((relatedEventId) => {
        expect(eventIds.has(relatedEventId), `${eventId} -> ${relatedEventId}`).toBe(true);
      });
      detail?.sourceIds.forEach((sourceId) => {
        expect(sourceIds.has(sourceId), `${eventId} -> ${sourceId}`).toBe(true);
      });
    });
  });
});
