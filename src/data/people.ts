import type { Person } from '../domain/types';

export const people: Person[] = [
  { id: 'liu-bang', name: '刘邦', aliases: ['汉高祖'], birthYear: -256, deathYear: -195, roles: ['皇帝', '起兵领袖'], polityIds: ['han_western'], description: '楚汉战争后建立汉朝，定都长安。', sourceIds: ['zizhi-tongjian'] },
  { id: 'wang-mang', name: '王莽', roles: ['皇帝', '外戚'], polityIds: ['xin'], description: '建立新朝，长安是其政治中心。', sourceIds: ['zizhi-tongjian'] },
  { id: 'liu-xiu', name: '刘秀', aliases: ['汉光武帝'], birthYear: -5, deathYear: 57, roles: ['皇帝'], polityIds: ['gengshi', 'han_eastern'], description: '新末起兵并建立东汉，迁都洛阳。', sourceIds: ['zizhi-tongjian'] },
  { id: 'liu-yao', name: '刘曜', roles: ['皇帝'], polityIds: ['former_zhao'], description: '前赵君主，曾以长安为政治中心。', sourceIds: ['zizhi-tongjian'] },
  { id: 'fu-jian', name: '苻坚', birthYear: 338, deathYear: 385, roles: ['皇帝'], polityIds: ['former_qin'], description: '前秦君主，以长安为核心经营关中并北伐扩张。', sourceIds: ['zizhi-tongjian'] },
  { id: 'yao-chang', name: '姚苌', birthYear: 330, deathYear: 393, roles: ['皇帝', '军事领袖'], polityIds: ['later_qin'], description: '后秦建立者，后秦以长安为都。', sourceIds: ['zizhi-tongjian'] },
  { id: 'yang-jian', name: '杨坚', aliases: ['隋文帝'], birthYear: 541, deathYear: 604, roles: ['皇帝'], polityIds: ['sui'], description: '建立隋朝；隋初在长安营建大兴城。', sourceIds: ['zizhi-tongjian'] },
  { id: 'li-yuan', name: '李渊', aliases: ['唐高祖'], birthYear: 566, deathYear: 635, roles: ['皇帝', '军事领袖'], polityIds: ['tang'], description: '入据长安并建立唐朝。', sourceIds: ['zizhi-tongjian'] },
  { id: 'li-shimin', name: '李世民', aliases: ['唐太宗'], birthYear: 598, deathYear: 649, roles: ['皇帝', '军事领袖'], polityIds: ['tang'], description: '唐太宗时期以长安为帝国政治与文化中心。', sourceIds: ['zizhi-tongjian'] },
];

export const personById = Object.fromEntries(people.map((person) => [person.id, person]));
