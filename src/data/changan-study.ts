import type { HistoricalEvent, Person, HeritageAsset, Place, Polity, HistoricalClaim } from '../domain/types';
import { claims } from './claims';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';

export const changanCityId = 'changan';

// 长安城市视角保留所有曾以长安为都、曾直接争夺长安或在长安政治史中
// 留下明确节点的政权；“关联”不等于它们在全期都直接控制长安。
export const changanPolityIds = [
  'zhou_western', 'qin', 'han_western', 'xin', 'gengshi', 'han_eastern',
  'former_zhao', 'former_qin', 'later_qin', 'xia', 'wei_western', 'zhou_northern',
  'sui', 'tang', 'wu_zhou', 'liang_later', 'tang_later',
];

export const changanEvents: HistoricalEvent[] = [
  { id: 'changan-han-capital', year: -200, title: '汉定都长安', summary: '高帝七年刘邦见萧何治宫室于长安后迁都长安，长安首都阶段由此获得直接编年依据。', placeId: changanCityId, sourceIds: ['zizhi-tongjian', 'zizhi-tongjian-vol11-han-capital'], category: '政权建立／迁都', verification: 'partial' },
  { id: 'changan-xin-founded', year: 9, title: '新朝建立', summary: '王莽代汉建立新朝，长安继续作为政治中心。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／更替', verification: 'partial' },
  { id: 'changan-gengshi', year: 25, title: '更始政权失去长安', summary: '更始政权在长安的统治结束，关中进入新的争夺。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '战争／更替', verification: 'partial' },
  { id: 'changan-former-zhao', year: 304, title: '前赵经营长安', summary: '十六国时期前赵以关中和长安为重要政治中心。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／迁都', verification: 'partial' },
  { id: 'changan-former-qin', year: 351, title: '前秦据长安', summary: '前秦以长安为核心扩张并经营关中。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／战争', verification: 'partial' },
  { id: 'changan-later-qin', year: 384, title: '后秦建立并据长安', summary: '后秦在十六国后期控制长安，城市成为北方政治竞争节点。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／战争', verification: 'partial' },
  { id: 'daxing-built', year: 582, title: '隋营建大兴城', summary: '隋文帝时期在汉长安城东南营建新的大兴城。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '城市建设', verification: 'partial' },
  { id: 'tang-founded-changan', year: 618, title: '唐在长安建立', summary: '李渊入据长安并建立唐朝，城市进入新的帝国周期。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／更替', verification: 'checked' },
  { id: 'daming-palace-built', year: 634, title: '大明宫营建', summary: '唐太宗先营永安宫、次年改名大明宫；高宗时期又重建并完成新的宫城阶段。', placeId: changanCityId, sourceIds: ['zizhi-tongjian', 'tanghuiyao-vol30-daming-palace', 'modern-geography-reference'], category: '城市建设', verification: 'partial' },
  { id: 'tang-changan-end', year: 907, title: '唐亡与长安政治中心转移', summary: '唐朝结束后，长安不再是中原王朝持续稳定的首都。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／更替', verification: 'partial' },
  { id: 'zhou-fenghao-capital', year: -1046, title: '周以丰镐为核心经营关中', summary: '西周早期以丰镐为王朝核心，奠定关中都城与宗周秩序。', placeId: changanCityId, sourceIds: ['china-chronology', 'modern-geography-reference'], category: '都城／政权', verification: 'partial' },
  { id: 'qin-xianyang-capital', year: -350, title: '秦迁都咸阳', summary: '秦以咸阳为政治中心，关中成为其向东扩张的制度与军事基地。', placeId: 'xianyang', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'], category: '迁都／城市', verification: 'partial' },
  { id: 'qin-xianyang-unification', year: -221, title: '秦以咸阳统合天下', summary: '秦完成统一后以咸阳为帝国中心，秦都与后来的汉长安形成关中城市连续性。', placeId: 'xianyang', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'], category: '统一／都城', verification: 'checked' },
  { id: 'han-changan-new-city', year: -200, title: '汉长安新城基本成形', summary: '汉在秦咸阳旧域以南营建长安新都，政治中心由咸阳转向汉长安。', placeId: changanCityId, sourceIds: ['zizhi-tongjian', 'modern-geography-reference'], category: '城市建设／迁都', verification: 'partial' },
  { id: 'han-wudi-expands-changan', year: -138, title: '汉武帝时期长安宫城扩展', summary: '西汉中期长安宫室与礼制空间持续扩建，城市承载帝国集权与对外动员。', placeId: changanCityId, sourceIds: ['zizhi-tongjian', 'modern-geography-reference'], category: '城市建设／帝国', verification: 'partial' },
  { id: 'gengshi-enters-changan', year: 23, title: '更始军进入长安', summary: '新末战争中更始政权攻入长安，王莽政权的都城控制崩解。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '战争／政权更替', verification: 'partial' },
  { id: 'dong-zhuo-changan', year: 192, title: '董卓迁汉献帝至长安', summary: '东汉末董卓挟持汉献帝西迁长安，长安再次成为汉末中央政治与军阀竞争节点。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '迁都／政争', verification: 'partial' },
  { id: 'eastern-han-restores-changan', year: 25, title: '东汉恢复后长安地位改变', summary: '刘秀建立东汉并定都洛阳，长安由帝国首都转为关中重镇。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／都城转移', verification: 'checked' },
  { id: 'eastern-han-moves-luoyang', year: 25, title: '东汉定都洛阳', summary: '东汉以洛阳为首都，长安的政治中心地位被洛阳取代，但仍保留西京与关中节点意义。', placeId: 'luoyang', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'], category: '迁都／城市', verification: 'checked' },
  { id: 'western-jin-loses-changan', year: 316, title: '西晋失守长安', summary: '长安失守标志西晋在关中与北方的统治终结，晋室南渡的局面随之确定。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '战争／政权更替', verification: 'checked' },
  { id: 'former-zhao-capital-changan', year: 319, title: '前赵以长安为都', summary: '前赵控制关中并以长安为核心经营北方政权，十六国都城竞争进入新阶段。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '都城／十六国', verification: 'partial' },
  { id: 'later-qin-falls-changan', year: 417, title: '后秦失去长安', summary: '后秦在长安的统治被刘裕北伐击破，关中再度成为南北政权争夺的枢纽。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '战争／十六国', verification: 'partial' },
  { id: 'liu-yu-captures-changan', year: 417, title: '刘裕攻取长安', summary: '东晋刘裕北伐攻取长安，短暂恢复南方政权对关中的直接控制。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '战争／北伐', verification: 'partial' },
  { id: 'western-wei-changan', year: 535, title: '西魏定都长安', summary: '北魏分裂后，西魏以长安为都，关中成为北朝西部政权的政治核心。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权建立／都城', verification: 'partial' },
  { id: 'northern-zhou-changan', year: 557, title: '北周承接长安政权', summary: '北周取代西魏并继续以长安为都，关中政治中心地位延续到隋统一前夕。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政权更替／都城', verification: 'partial' },
  { id: 'daxing-capital', year: 583, title: '大兴城成为隋都', summary: '隋在大兴城形成新都城格局，承接长安地区的都城传统并重塑城市空间。', placeId: changanCityId, sourceIds: ['zizhi-tongjian', 'modern-geography-reference'], category: '城市建设／都城', verification: 'partial' },
  { id: 'xuanwu-gate', year: 626, title: '玄武门之变', summary: '唐初长安宫城内发生玄武门之变，皇位继承与中央权力结构随之重组。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '政争／唐初', verification: 'checked' },
  { id: 'tang-changan-occupation', year: 756, title: '安禄山军攻占长安', summary: '安史之乱中唐玄宗离开长安，叛军一度占据都城，唐中央秩序遭遇重大危机。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '战争／城市危机', verification: 'checked' },
  { id: 'huang-chao-changan', year: 880, title: '黄巢军进入长安', summary: '唐末黄巢起义军攻入长安并建立大齐政权，唐都控制进一步瓦解。', placeId: changanCityId, sourceIds: ['zizhi-tongjian'], category: '战争／政权更替', verification: 'partial' },
  { id: 'court-moves-luoyang', year: 904, title: '朱全忠迁唐昭宗至洛阳', summary: '唐末朱全忠强制迁都洛阳，长安作为持续性帝国首都的地位由此实质终结。', placeId: 'luoyang', sourceIds: ['zizhi-tongjian'], category: '迁都／唐末', verification: 'checked' },
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
  const selectedPolities = polities.filter((polity) => politySet.has(polity.id));
  const selectedPeople = people.filter((person) => person.polityIds?.some((id) => politySet.has(id)));
  const selectedHeritage = heritageAssets.filter((asset) => asset.placeId === changanCityId);
  const entityIds = new Set([
    changanCityId,
    ...selectedPolities.map((polity) => polity.id),
    ...selectedPeople.map((person) => person.id),
    ...selectedHeritage.map((asset) => asset.id),
  ]);
  return {
    city: places.find((place) => place.id === changanCityId)!,
    polities: selectedPolities,
    people: selectedPeople,
    heritage: selectedHeritage,
    events: changanEvents,
    claims: claims.filter((claim) => (
      (claim.subjectId === changanCityId || claim.objectId === changanCityId || politySet.has(claim.subjectId) || politySet.has(claim.objectId ?? ''))
      && entityIds.has(claim.subjectId)
      && (!claim.objectId || entityIds.has(claim.objectId))
    )),
  };
}
