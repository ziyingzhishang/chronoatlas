import { describe, expect, it } from 'vitest';

import { capitalHistory } from './capital-history';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { personDetails } from './person-details';
import { places } from './places';
import { polityDetails } from './polity-details';
import { sourceById } from './sources';

describe('金中都城市视角知识闭环', () => {
  it('connects the capital phase, move-to-Zhongdu event, Wanyan Liang and heritage layer', () => {
    expect(places.find((item) => item.id === 'jin_zhongdu')).toMatchObject({ modernName: '北京市', mappingStatus: 'regional', pointType: 'archaeological-site' });
    expect(capitalHistory).toEqual(expect.arrayContaining([
      expect.objectContaining({ polityId: 'jin_jurchen', placeId: 'jin_zhongdu', validFrom: 1153, validTo: 1214 }),
    ]));
    expect(people.find((item) => item.id === 'wanyan-liang')).toMatchObject({ polityIds: ['jin_jurchen'] });
    expect(personDetails.find((item) => item.personId === 'wanyan-liang')?.keyEvents).toContain('jurchen-jin-moves-zhongdu');
    expect(events.find((item) => item.id === 'jurchen-jin-moves-zhongdu')).toMatchObject({ year: 1153, placeId: 'jin_zhongdu', category: '都城营建／迁都' });
    expect(eventDetails.find((item) => item.eventId === 'jurchen-jin-moves-zhongdu')).toMatchObject({ polityIds: ['jin_jurchen'], locationIds: ['jin_zhongdu'] });
    expect(heritageAssets.find((item) => item.id === 'jin-zhongdu-city-site')).toMatchObject({ placeId: 'jin_zhongdu', type: 'city-site', modernStatus: 'archaeological-site' });
    expect(getHeritageDetail('jin-zhongdu-city-site')).toMatchObject({ associatedPolities: expect.arrayContaining(['jin_jurchen']), associatedEvents: expect.arrayContaining(['jurchen-jin-moves-zhongdu']), associatedPeople: expect.arrayContaining(['wanyan-liang']) });
    expect(polityDetails.find((item) => item.polityId === 'jin_jurchen')?.eventIds).toContain('jurchen-jin-moves-zhongdu');
    expect(polityDetails.find((item) => item.polityId === 'jin_jurchen')?.heritageIds).toContain('jin-zhongdu-city-site');
    expect(sourceById['beijing-jin-zhongdu-archaeology']).toBeDefined();
  });

  it('keeps the founding event distinct and records the person-event claim', () => {
    expect(events.filter((item) => item.id === 'jurchen-jin-founded')).toHaveLength(1);
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'wanyan-liang', predicate: 'participated-in', objectId: 'jurchen-jin-moves-zhongdu' }),
      expect.objectContaining({ subjectId: 'wanyan-liang', predicate: 'ruled', objectId: 'jin_jurchen' }),
    ]));
  });
});
