import type { HistoricalEvent, Person, HeritageAsset, Place, Polity, HistoricalClaim } from '../domain/types';
import { claims } from './claims';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';

export const changanCityId = 'changan';

export const changanPolityIds = ['han_western', 'xin', 'former_zhao', 'former_qin', 'later_qin', 'wei_western', 'zhou_northern', 'sui', 'tang'];

export const changanEvents: HistoricalEvent[] = [
  { id: 'changan-han-capital', year: -202, title: '汉定都长安', summary: '汉在楚汉战争后以长安为帝国政治中心。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／迁都', verification: 'partial' },
  { id: 'changan-xin-founded', year: 9, title: '新朝建立', summary: '王莽代汉建立新朝，长安继续作为政治中心。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／更替', verification: 'partial' },
  { id: 'changan-gengshi', year: 25, title: '更始政权失去长安', summary: '更始政权在长安的统治结束，关中进入新的争夺。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '战争／更替', verification: 'partial' },
  { id: 'changan-former-zhao', year: 304, title: '前赵经营长安', summary: '十六国时期前赵以关中和长安为重要政治中心。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／迁都', verification: 'partial' },
  { id: 'changan-former-qin', year: 351, title: '前秦据长安', summary: '前秦以长安为核心扩张并经营关中。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／战争', verification: 'partial' },
  { id: 'changan-later-qin', year: 384, title: '后秦建立并据长安', summary: '后秦在十六国后期控制长安，城市成为北方政治竞争节点。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／战争', verification: 'partial' },
  { id: 'daxing-built', year: 582, title: '隋营建大兴城', summary: '隋文帝时期在汉长安城东南营建新的大兴城。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '城市建设', verification: 'partial' },
  { id: 'tang-founded-changan', year: 618, title: '唐在长安建立', summary: '李渊入据长安并建立唐朝，城市进入新的帝国周期。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／更替', verification: 'checked' },
  { id: 'daming-palace-built', year: 634, title: '大明宫营建', summary: '唐代长安宫城体系继续扩展，大明宫成为重要政治空间。', placeId: changanCityId, sourceIds: ['modern-geography-reference'], category: '城市建设', verification: 'partial' },
  { id: 'tang-changan-end', year: 907, title: '唐亡与长安政治中心转移', summary: '唐朝结束后，长安不再是中原王朝持续稳定的首都。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／更替', verification: 'partial' },
];

export interface ChanganStudyBundle {
  city: Place;
  polities: Polity[];
  people: Person[];
  heritage: HeritageAsset[];
  events: HistoricalEvent[];
  claims: HistoricalClaim[];
}

export function getChanganStudyBundle(): ChanganStudyBundle {
  const politySet = new Set(changanPolityIds);
  return {
    city: places.find((place) => place.id === changanCityId)!,
    polities: polities.filter((polity) => politySet.has(polity.id)),
    people: people.filter((person) => person.polityIds?.some((id) => politySet.has(id))),
    heritage: heritageAssets.filter((asset) => asset.placeId === changanCityId),
    events: changanEvents,
    claims: claims.filter((claim) => claim.subjectId === changanCityId || claim.objectId === changanCityId || politySet.has(claim.subjectId) || politySet.has(claim.objectId ?? '')),
  };
}
