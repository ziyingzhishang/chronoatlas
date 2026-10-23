import { describe, expect, it } from 'vitest';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('round 118 Western Han mausoleum graph closure', () => {
  it('connects each mausoleum to its ruler, construction event, and Western Han perspective', () => {
    const cases = [
      { heritageId: 'maoling', personId: 'liu-che', eventId: 'maoling-built', year: -139 },
      { heritageId: 'du-ling', personId: 'liu-xun', eventId: 'du-ling-built', year: -65 },
    ] as const;

    for (const item of cases) {
      const heritage = getHeritageDetail(item.heritageId);
      const event = getEventDetail(item.eventId);
      const person = getPersonDetail(item.personId);

      expect(heritage?.associatedPeople).toContain(item.personId);
      expect(heritage?.associatedEvents).toContain(item.eventId);
      expect(heritage?.associatedPolities).toEqual(['han_western']);
      expect(event).toMatchObject({
        eventId: item.eventId,
        polityIds: ['han_western'],
        locationIds: ['changan'],
      });
      expect(event?.phases?.some((phase) => phase.startYear === item.year && phase.endYear === item.year)).toBe(true);
      expect(event?.participants).toEqual([{ personId: item.personId, role: expect.any(String) }]);
      expect(person?.keyEvents).toContain(item.eventId);
      expect(getPolityDetail('han_western')?.heritageIds).toContain(item.heritageId);
      expect(getPolityDetail('han_western')?.eventIds).toContain(item.eventId);
    }
  });

  it('keeps the accession year separate from the Duling construction year', () => {
    expect(getPersonDetail('liu-xun')?.offices[0]).toMatchObject({ validFrom: -74, validTo: -49 });
    expect(getEventDetail('du-ling-built')?.phases?.[0]).toMatchObject({ startYear: -65, endYear: -65 });
    expect(getHeritageDetail('du-ling')?.uncertaintyNote).toContain('前74年为汉宣帝即位年');
  });
});
