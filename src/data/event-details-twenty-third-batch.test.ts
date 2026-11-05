import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';

const targetLocations = {
  'western-liang-state-founded': ['dunhuang', 'jiuquan', 'liangzhou'],
  'dali-founded': ['dali_city', 'yangjumei'],
  'song-southward': ['kaifeng', 'song_yingtian', 'linan'],
  'northern-yuan-founded': ['beiyuan_core'],
  'tumu-incident-1449': ['tumu-village'],
  'southern-ming-founded': ['yingtian', 'yangzhou', 'fuzhou', 'guangzhou', 'zhaoqing'],
  'qing-enters-pass': ['shengjing', 'beijing'],
  'republic-founded': ['jiankang'],
  'prc-founded': ['beijing'],
} as const;

describe('twenty-third-batch event location closure', () => {
  it('keeps the 1124 Western Liao migration unlocated instead of backfilling Balasagun', () => {
    const event = events.find((candidate) => candidate.id === 'western-liao-founded');
    const detail = eventDetails.find((candidate) => candidate.eventId === 'western-liao-founded');
    const report = auditKnowledgeCoverage();

    expect(event).toMatchObject({year:1124, verification:'partial'});
    expect(event?.coordinates).toBeUndefined();
    expect(detail?.locationIds).toEqual([]);
    expect(detail?.uncertaintyNote).toContain('1134年作为');
    expect(report.tasks.some((task) => (
      task.taskKind === 'event-location-missing' && task.entityId === 'western-liao-founded'
    ))).toBe(true);
  });

  it('keeps Southern Song accession at Song Yingtian in Shangqiu, distinct from Ming Yingtian in Nanjing', () => {
    const event = events.find((candidate) => candidate.id === 'southern-song-founded');
    const detail = eventDetails.find((candidate) => candidate.eventId === 'southern-song-founded');

    expect(event).toMatchObject({placeId:'song_yingtian', year:1127});
    expect(detail?.locationIds).toContain('song_yingtian');
    expect(places.find((place) => place.id === 'song_yingtian')).toMatchObject({
      historicalName:'南京应天府', modernName:'商丘市一带', longitude:115.65, latitude:34.45,
    });
    expect(event?.placeId).not.toBe('yingtian');
  });

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

  it('keeps the Han imperial accession linked to its verified regional reference', () => {
    const detail = eventDetails.find((candidate) => candidate.eventId === 'han-imperial-accession');
    const report = auditKnowledgeCoverage();

    expect(report.tasks.some((task) => (
      task.taskKind === 'event-location-missing' && task.entityId === 'han-imperial-accession'
    ))).toBe(false);
    expect(detail?.locationIds).toEqual(['sishui-northbank']);
    expect(detail?.uncertaintyNote).toContain('定陶');
  });

  it('links the Tumu event marker to a low-confidence regional place without implying a fort-site survey', () => {
    const event = events.find((candidate) => candidate.id === 'tumu-incident-1449');
    const detail = eventDetails.find((candidate) => candidate.eventId === 'tumu-incident-1449');
    const place = places.find((candidate) => candidate.id === 'tumu-village');

    expect(event).toMatchObject({year:1449, coordinates:[115.6064,40.3814], locationPrecision:'approximate'});
    expect(detail?.locationIds).toEqual(['tumu-village']);
    expect(place).toMatchObject({
      longitude:115.6064,
      latitude:40.3814,
      validFrom:1449,
      validTo:1449,
      pointType:'regional-reference',
      mappingStatus:'regional',
      confidence:'low',
    });
    expect(place?.notes).toContain('不认定土木堡遗址或精确战场坐标');
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
