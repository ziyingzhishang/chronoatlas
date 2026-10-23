import { describe, expect, it } from 'vitest';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('round 117 White Horse Temple founding event', () => {
  it('adds a sourced Eastern Han construction endpoint while preserving the later Tang layer', () => {
    const event = getEventDetail('white-horse-temple-founded');
    const heritage = getHeritageDetail('white-horse-temple');

    expect(event).toMatchObject({
      eventId: 'white-horse-temple-founded',
      polityIds: ['han_eastern'],
      locationIds: ['luoyang'],
      sourceIds: ['luoyang-baimasi-official'],
    });
    expect(event?.phases).toEqual([
      expect.objectContaining({ startYear: 68, endYear: 68 }),
    ]);
    expect(heritage?.associatedEvents).toContain('white-horse-temple-founded');
    expect(heritage?.associatedPolities).toEqual(['han_eastern', 'tang']);
    expect(getPolityDetail('han_eastern')?.heritageIds).not.toContain('white-horse-temple');
    expect(sourceById['luoyang-baimasi-official']?.scope).toContain('68年创建');
  });
});
