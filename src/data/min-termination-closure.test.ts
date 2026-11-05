import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';
import { getHistoricalState } from '../domain/history-state';
import { buildLocalMapData } from '../map/history-map';

describe('Min termination closure', () => {
  it('records the 945 Southern Tang conquest as the Min termination event', () => {
    const event = events.find((item) => item.id === 'min-ended-945');
    const detail = eventDetails.find((item) => item.eventId === 'min-ended-945');

    expect(event).toMatchObject({
      id: 'min-ended-945',
      year: 945,
      placeId: 'jianzhou',
      coordinates: [118.32378, 27.03886],
      datePrecision: 'approximate',
    });
    expect(detail).toMatchObject({
      eventId: 'min-ended-945',
      polityIds: expect.arrayContaining(['min', 'southern_tang']),
      locationIds: ['jianzhou'],
    });
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'wang-yanzheng' }),
      expect.objectContaining({ personId: 'li-jing' }),
    ]));
    expect(detail?.relatedEventIds).toEqual(expect.arrayContaining(['min-founded', 'southern-tang-conquers-min']));
    for (const sourceId of [...(event?.sourceIds ?? []), ...(detail?.sourceIds ?? [])]) {
      expect(sourceById[sourceId], sourceId).toBeDefined();
    }
    expect(buildLocalMapData(getHistoricalState(945)).events.features).toContainEqual(expect.objectContaining({
      geometry: { type: 'Point', coordinates: [118.32378, 27.03886] },
      properties: expect.objectContaining({ entityId: 'min-ended-945' }),
    }));
  });

  it('moves Min political-center mapping from Fuzhou to Jianzhou before its 945 termination', () => {
    const state942 = getHistoricalState(942);
    const state943 = getHistoricalState(943);
    const fuzhou = buildLocalMapData(state942).capitalPlaces.features
      .filter(feature => feature.properties?.polityId === 'min');
    const jianzhou = buildLocalMapData(state943).capitalPlaces.features
      .filter(feature => feature.properties?.polityId === 'min');

    expect(fuzhou).toContainEqual(expect.objectContaining({
      geometry: { type: 'Point', coordinates: [119.30, 26.08] },
      properties: expect.objectContaining({ placeId: 'fuzhou' }),
    }));
    expect(jianzhou).toContainEqual(expect.objectContaining({
      geometry: { type: 'Point', coordinates: [118.32378, 27.03886] },
      properties: expect.objectContaining({ placeId: 'jianzhou' }),
    }));
  });

  it('maps the separate 946 Southern Tang assault on Fuzhou as an event point', () => {
    const event = events.find((item) => item.id === 'southern-tang-assaults-fuzhou-946');
    const detail = eventDetails.find((item) => item.eventId === 'southern-tang-assaults-fuzhou-946');

    expect(event).toMatchObject({
      year: 946,
      placeId: 'fuzhou',
      coordinates: [119.30, 26.08],
      sourceIds: expect.arrayContaining(['zizhi-tongjian-southern-tang-937-959']),
    });
    expect(detail).toMatchObject({ polityIds: ['southern_tang'], locationIds: ['fuzhou'] });
    expect(buildLocalMapData(getHistoricalState(946)).events.features).toContainEqual(expect.objectContaining({
      geometry: { type: 'Point', coordinates: [119.30, 26.08] },
      properties: expect.objectContaining({ entityId: 'southern-tang-assaults-fuzhou-946' }),
    }));
  });

  it('connects the last ruler and Fuzhou heritage succession', () => {
    const polity = getPolityDetail('min');
    const person = people.find((item) => item.id === 'wang-yanzheng');
    const personDetail = getPersonDetail('wang-yanzheng');
    const heritage = heritageAssets.find((item) => item.id === 'min-wang-mausoleum');
    const heritageDetail = getHeritageDetail('min-wang-mausoleum');

    expect(person).toMatchObject({
      polityIds: ['min'],
      roles: expect.arrayContaining(['末代君主']),
    });
    expect(personDetail).toMatchObject({
      personId: 'wang-yanzheng',
      keyEvents: expect.arrayContaining(['min-ended-945']),
    });
    expect(polity).toMatchObject({
      principalFigureIds: expect.arrayContaining(['wang-shenzhi', 'wang-yanzheng']),
      eventIds: expect.arrayContaining(['min-ended-945']),
      heritageIds: expect.arrayContaining(['min-wang-mausoleum']),
    });
    expect(heritage).toMatchObject({ placeId: 'fuzhou', constructionFrom: 925 });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining(['min-founded', 'min-ended-945']),
      associatedPeople: expect.arrayContaining(['wang-shenzhi', 'wang-yanzheng', 'li-jing']),
      associatedPolities: expect.arrayContaining(['min', 'southern_tang']),
    });
  });

  it('exposes the last-ruler governance, kinship, and transition relationships', () => {
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'claim-wang-yanzheng-ruled-min' }),
      expect.objectContaining({ id: 'claim-wang-yanzheng-participated-min-ended-945' }),
      expect.objectContaining({ id: 'claim-wang-yanzheng-enemy-li-jing-termination-945' }),
      expect.objectContaining({ id: 'claim-wang-yanzheng-sibling-wang-yenxi' }),
    ]));
  });
});
