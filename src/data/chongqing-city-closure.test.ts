import { describe, expect, it } from 'vitest';

import { eventDetails } from './event-details';
import { events } from './events';
import { polityDetails } from './polity-details';
import { sourceById } from './sources';

describe('重庆战时中央驻地城市视角闭环', () => {
  it('records the wartime political-center event without inventing a person or heritage asset', () => {
    const event = events.find((item) => item.id === 'republic-chongqing-wartime-center');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const republic = polityDetails.find((item) => item.polityId === 'republic');

    expect(event).toMatchObject({
      year: 1938,
      endYear: 1945,
      placeId: 'chongqing',
      datePrecision: 'range',
    });
    expect(detail).toMatchObject({
      participants: [expect.objectContaining({ personId: 'chiang-kai-shek', relationType: 'direct' })],
      polityIds: ['republic'],
      locationIds: ['chongqing'],
      relatedEventIds: ['republic-founded'],
    });
    expect(detail?.uncertaintyNote).toContain('永久首都');
    expect(event?.sourceIds).toEqual(expect.arrayContaining(['capital-history-reference', 'modern-geography-reference']));
    expect(republic?.eventIds).toContain('republic-chongqing-wartime-center');
    expect(sourceById['capital-history-reference']).toBeDefined();
  });
});
