import type { HistoricalClaim, PersonDetail } from '../domain/types';

const sourceIds = ['zizhi-tongjian'];

export const personDetails: PersonDetail[] = [
  {
    personId: 'liu-bang', biography: '刘邦出身平民，经历秦末战争与楚汉竞争，最终建立汉朝，并以长安作为帝国政治中心。',
    aliases: ['汉高祖'], offices: [{ title: '汉王', polityId: 'han_western', validFrom: -206, validTo: -202, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-han-capital', 'han-imperial-accession'], sourceIds,
    uncertaintyNote: '汉的建立可按受封汉王与称帝两个节点叙述，本详情不把二者合并为单一日期。',
  },
  {
    personId: 'wang-mang', biography: '王莽以外戚与辅政身份进入权力核心，代汉建立新朝，长安继续作为政治中心。',
    aliases: [], offices: [{ title: '新朝皇帝', polityId: 'xin', placeId: 'changan', validFrom: 9, validTo: 23, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-xin-founded'], sourceIds,
    uncertaintyNote: '王莽改制的制度评价与成败原因存在不同解释，页面只呈现可追溯的编年节点。',
  },
  {
    personId: 'liu-xiu', biography: '刘秀在新末动荡中起兵，重建汉室并成为东汉开国君主；其早期政治活动与长安权力更替相连。',
    aliases: ['汉光武帝'], offices: [{ title: '更始政权将领／东汉皇帝', polityId: 'han_eastern', validFrom: 25, validTo: 57, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-gengshi'], sourceIds,
    uncertaintyNote: '更始、刘秀与长安之间的控制转换按阶段记录，不由单个事件点推导连续疆域。',
  },
  {
    personId: 'liu-yao', biography: '刘曜是十六国时期前赵的重要君主，前赵经营关中时，长安成为北方政治竞争的关键节点。',
    aliases: [], offices: [{ title: '前赵皇帝', polityId: 'former_zhao', placeId: 'changan', validFrom: 318, validTo: 329, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-former-zhao'], sourceIds,
    uncertaintyNote: '十六国时期的政治中心和直接控制范围变化频繁，相关叙述保留阶段性而非连续边界判断。',
  },
  {
    personId: 'fu-jian', biography: '苻坚在前秦政治中整合关中并推动北方扩张，长安是其政权运作和军事动员的重要中心。',
    aliases: [], offices: [{ title: '前秦皇帝', polityId: 'former_qin', placeId: 'changan', validFrom: 357, validTo: 385, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-former-qin'], sourceIds,
    uncertaintyNote: '“统一北方”的概括与各地实际控制并不等价，详情保留前秦扩张叙事的范围限制。',
  },
  {
    personId: 'yao-chang', biography: '姚苌在十六国后期建立后秦，后秦以长安为都，长安再次成为关中政权更替的中心。',
    aliases: [], offices: [{ title: '后秦皇帝', polityId: 'later_qin', placeId: 'changan', validFrom: 384, validTo: 393, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-later-qin'], sourceIds,
    uncertaintyNote: '后秦建立与占据长安是相关但不同层次的历史过程，按事件和任职分别记录。',
  },
  {
    personId: 'yang-jian', biography: '杨坚建立隋朝，并在汉长安城东南营建大兴城，开启隋唐长安城市空间的新阶段。',
    aliases: ['隋文帝'], offices: [{ title: '隋皇帝', polityId: 'sui', placeId: 'changan', validFrom: 581, validTo: 604, datePrecision: 'range', sourceIds }],
    keyEvents: ['daxing-built'], sourceIds,
    uncertaintyNote: '大兴城与汉长安城是相邻而有区别的城市空间，不能用现代西安边界替代历史城址。',
  },
  {
    personId: 'li-yuan', biography: '李渊控制长安后建立唐朝，唐初长安成为新的帝国政治中心。',
    aliases: ['唐高祖'], offices: [{ title: '唐皇帝', polityId: 'tang', placeId: 'changan', validFrom: 618, validTo: 626, datePrecision: 'range', sourceIds }],
    keyEvents: ['tang-founded-changan'], sourceIds,
    uncertaintyNote: '618年是唐建立的关键节点，不代表唐在当年已经完成对所有地区的整合。',
  },
  {
    personId: 'li-shimin', biography: '李世民是唐初军事与政治核心，继位后以长安为帝国政治和文化中心之一。',
    aliases: ['唐太宗'], offices: [{ title: '秦王／唐皇帝', polityId: 'tang', placeId: 'changan', validFrom: 618, validTo: 649, datePrecision: 'range', sourceIds }],
    keyEvents: ['tang-founded-changan'], sourceIds,
    uncertaintyNote: '早年秦王经历、626年继位与其后皇帝时期属于不同政治阶段，本详情将其合并为可读的任职段落。',
  },
];

export const personRelationshipClaims: HistoricalClaim[] = [
  { id: 'claim-li-yuan-parent-li-shimin', subjectId: 'li-yuan', predicate: 'parent-of', objectId: 'li-shimin', validFrom: 598, validTo: 635, datePrecision: 'range', perspective: 'person', evidenceType: 'explicit-record', confidence: 'high', sourceIds },
  { id: 'claim-li-shimin-served-li-yuan', subjectId: 'li-shimin', predicate: 'served', objectId: 'li-yuan', validFrom: 618, validTo: 626, datePrecision: 'range', perspective: 'person', evidenceType: 'cross-checked', confidence: 'medium', sourceIds },
  { id: 'claim-li-yuan-appointed-li-shimin', subjectId: 'li-yuan', predicate: 'appointed', objectId: 'li-shimin', validFrom: 618, validTo: 626, datePrecision: 'range', perspective: 'person', evidenceType: 'explicit-record', confidence: 'medium', sourceIds, uncertaintyNote: '此处仅保留任用关系的方向，具体职衔与时间应结合分项史料。' },
  { id: 'claim-li-yuan-ally-li-shimin', subjectId: 'li-yuan', predicate: 'ally-of', objectId: 'li-shimin', validFrom: 618, validTo: 626, datePrecision: 'range', perspective: 'person', evidenceType: 'cross-checked', confidence: 'medium', sourceIds },
  { id: 'claim-wang-mang-enemy-liu-xiu', subjectId: 'wang-mang', predicate: 'enemy-of', objectId: 'liu-xiu', validFrom: 23, validTo: 25, datePrecision: 'range', perspective: 'person', evidenceType: 'inference', confidence: 'low', sourceIds, uncertaintyNote: '“对立”是关系层的概括，不能替代具体战事和政治立场的分阶段说明。' },
];

const detailById = new Map(personDetails.map((detail) => [detail.personId, detail]));

export function getPersonDetail(personId: string): PersonDetail | undefined {
  return detailById.get(personId);
}
