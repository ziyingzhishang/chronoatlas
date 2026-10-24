import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { sourceNotes } from './sources';

const boundaries = [
  {
    left: 'piluo-ge',
    right: 'geluofeng',
    eventId: 'nanzhao-founded',
    reason: '南诏形成事件同时记录父子王权承接和部族联盟背景，但两人之间没有直接 ally-of 或 enemy-of 语义；父子与继承不能升级为联盟边。',
  },
  {
    left: 'jumong',
    right: 'daemusin',
    eventId: 'goguryeo-founded',
    reason: '高句丽建国节点把朱蒙和后续王权扩展者放在同一形成叙事中，现有证据表达王统承接和国家形成，不表达两人的直接政治协作。',
  },
  {
    left: 'jumong',
    right: 'yuri-goguryeo',
    eventId: 'goguryeo-founded',
    reason: '朱蒙与琉璃明王的材料是父子/王统承接及后续迁都阶段，不能把连续政权史或亲属关系转写为 ally-of。',
  },
  {
    left: 'daemusin',
    right: 'yuri-goguryeo',
    eventId: 'goguryeo-founded',
    reason: '两人仅由后续王统形成事件共同承接，缺少同一政治行动中的直接协作或敌对陈述。',
  },
  {
    left: 'gwanggaeto',
    right: 'jangsu-goguryeo',
    eventId: 'goguryeo-moves-pyongyang',
    reason: '迁都详情表达前后两代高句丽君主的阶段承接，不能由迁都前后关系推断两人的联盟或敌对。',
  },
  {
    left: 'park-hyeokgeose',
    right: 'namhae-chachaung',
    eventId: 'silla-founded',
    reason: '新罗传统建国事件中的即位与早期王统承接属于继承关系，不是直接政治同盟证据。',
  },
  {
    left: 'park-hyeokgeose',
    right: 'naemul-isageum',
    eventId: 'silla-founded',
    reason: '建国君主与数百年后王权整合者被同一传统节点关联，年代与阶段跨越不能支撑两人直接协作或敌对。',
  },
  {
    left: 'namhae-chachaung',
    right: 'naemul-isageum',
    eventId: 'silla-founded',
    reason: '两人仅由新罗早期王统连续性和后续国家整合背景相连，没有明确的双人联盟或敌对行动。',
  },
  {
    left: 'namri-songtsen',
    right: 'tridu-songtsen',
    eventId: 'tibetan-founded',
    reason: '吐蕃形成详情只提供前置统治与后续制度成熟的跨代政治背景，缺少两人同时行动的直接协作语义。',
  },
  {
    left: 'zhang-gui',
    right: 'zhang-shi',
    eventId: 'former-liang-founded',
    reason: '张轨与张寔属于河西张氏政权的父子/继承承接，现有事件详情不能把家族与政权延续升级为 ally-of。',
  },
  {
    left: 'zhang-gui',
    right: 'zhang-mao',
    eventId: 'former-liang-founded',
    reason: '张轨与张茂之间隔着张氏政权的继承阶段，只有政权延续和后续秩序维持语义，没有直接双人协作或敌对语义。',
  },
  {
    left: 'zhang-shi',
    right: 'zhang-mao',
    eventId: 'former-liang-founded',
    reason: '张寔与张茂是连续继承阶段人物；同一政权的 succession 不能替代独立的联盟/对立证据。',
  },
  {
    left: 'han-qian',
    right: 'zhao-liehou',
    eventId: 'partition-jin',
    reason: '三家分晋详情只证明韩、赵同时获得周王室册命并进入诸侯秩序，属于共同制度节点，不是两人结盟或敌对。',
  },
  {
    left: 'han-qian',
    right: 'wei-wenhou',
    eventId: 'partition-jin',
    reason: '韩虔与魏斯共同出现在册命事件中，但共享诸侯制度确认和后续竞争背景不等于两人的直接政治联盟。',
  },
  {
    left: 'zhao-liehou',
    right: 'wei-wenhou',
    eventId: 'partition-jin',
    reason: '赵籍与魏斯的共同册命只表达三晋制度性并立；没有可闭合的双人协作或敌对行动。',
  },
  {
    left: 'zhu-yuyue',
    right: 'su-guansheng',
    eventId: 'shaowu-guangzhou-founded',
    reason: '绍武朝廷的君臣同场任职和两广抗清背景应由 governance 与事件参与表达，现有文本没有直接 ally-of 语义。',
  },
  {
    left: 'qin-mugong',
    right: 'qin-xiaogong',
    eventId: 'qin-state-founded-eighth-batch',
    reason: '秦国早期扩张与战国变法是跨时代国家发展线索，不能从同一政权史推断两位君主互为政治盟友。',
  },
  {
    left: 'oxenstierna',
    right: 'trauttmansdorff',
    eventId: 'peace-westphalia',
    reason: '威斯特伐利亚和谈中的瑞典与哈布斯堡代表是多方谈判参与者，谈判对手关系不等于 enemy-of，亦不等于 ally-of。',
  },
  {
    left: 'oxenstierna',
    right: 'chigi',
    eventId: 'peace-westphalia',
    reason: '瑞典代表与教廷调停代表共同参与多方和谈，只证明外交场景交集，不证明直接政治同盟或敌对。',
  },
  {
    left: 'trauttmansdorff',
    right: 'chigi',
    eventId: 'peace-westphalia',
    reason: '哈布斯堡代表与教廷调停代表的共同谈判场景没有双人关系语义，不能从战争背景或谈判参与推导 enemy-of。',
  },
] as const;

const peopleById = new Map(people.map((person) => [person.id, person]));
const eventById = new Map(events.map((event) => [event.id, event]));
const sourceIdSet = new Set(sourceNotes.map((source) => source.id));

function pairClaimExists(left: string, right: string): boolean {
  return claims.some((claim) => (
    (claim.predicate === 'ally-of' || claim.predicate === 'enemy-of')
    && ((claim.subjectId === left && claim.objectId === right)
      || (claim.subjectId === right && claim.objectId === left))
  ));
}

describe('round 126 alliance/conflict required-gap boundary audit', () => {
  it('keeps the current required alliance/conflict gap unchanged', () => {
    const report = buildPersonRelationshipCoverageReport();
    const required = new Set(report.requiredMissingByCategory.allianceConflict);

    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(111);
    expect(boundaries).toHaveLength(20);
    for (const boundary of boundaries) {
      expect(required.has(boundary.left), `${boundary.left}: required gap`).toBe(true);
      expect(required.has(boundary.right), `${boundary.right}: required gap`).toBe(true);
      expect(pairClaimExists(boundary.left, boundary.right), `${boundary.left}-${boundary.right}`).toBe(false);
      expect(boundary.reason.trim()).toBeTruthy();
    }
  });

  it('keeps every retained boundary parseable without upgrading shared context to a relationship', () => {
    for (const boundary of boundaries) {
      const left = peopleById.get(boundary.left);
      const right = peopleById.get(boundary.right);
      const event = eventById.get(boundary.eventId);
      const detail = eventDetails.find((item) => item.eventId === boundary.eventId);

      expect(left, `${boundary.left}: person endpoint`).toBeDefined();
      expect(right, `${boundary.right}: person endpoint`).toBeDefined();
      expect(event, `${boundary.eventId}: event endpoint`).toBeDefined();
      expect(detail, `${boundary.eventId}: detail endpoint`).toBeDefined();
      const directParticipants = detail?.participants.filter((participant) => participant.relationType !== 'contextual')
        .map((participant) => participant.personId) ?? [];
      if (boundary.eventId === 'qin-state-founded-eighth-batch') {
        expect(directParticipants).toContain('qin-xiangong');
      } else {
        expect(directParticipants).toEqual(expect.arrayContaining([boundary.left, boundary.right]));
      }
      expect(event?.year).toBeDefined();
      expect(event?.endYear === undefined || event.endYear >= event.year).toBe(true);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceIdSet.has(sourceId)), boundary.eventId).toBe(true);
    }
  });
});
