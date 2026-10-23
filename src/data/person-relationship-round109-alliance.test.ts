import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { sourceNotes } from './sources';

const boundaries = [
  {
    left: 'liu-xuan',
    right: 'liu-xiu',
    eventId: 'gengshi-founded',
    reason: '同属更始集团且刘秀曾受刘玄政权名义领导，现有证据表达参与和任职，不直接证明两人互为政治盟友。',
  },
  {
    left: 'zhu-yujian',
    right: 'huang-daozhou',
    eventId: 'longwu-fuzhou-founded',
    reason: '隆武朝廷中的君臣任职和共同抗清背景应由 served 与事件参与表达，不能从共同朝廷自动升级为 ally-of。',
  },
  {
    left: 'zhu-yuyue',
    right: 'su-guansheng',
    eventId: 'shaowu-guangzhou-founded',
    reason: '绍武朝廷君主与军政大臣的同场任职证据不足以单独证明 ally-of。',
  },
  {
    left: 'liu-bang',
    right: 'xiao-he',
    eventId: 'chu-han-contention',
    reason: '楚汉战争中的汉方核心领袖与行政后勤组织者属于协作背景，现有事件详情没有两人直接结盟语义。',
  },
  {
    left: 'ji-chang',
    right: 'zhou-gong-dan',
    eventId: 'zhou-conquest',
    reason: '周文王与周公旦处于克商前后不同阶段，宗室关系和共同王朝建构不能自动生成联盟边。',
  },
  {
    left: 'oxenstierna',
    right: 'chigi',
    eventId: 'peace-westphalia',
    reason: '同一多方和谈中的谈判代表只证明共同参与协商，不证明双方政治同盟或共同敌对。',
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

describe('round 109 alliance/conflict no-candidate boundary audit', () => {
  it('keeps the required alliance/conflict gap unchanged when no candidate passes', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(78);
    expect(boundaries).toHaveLength(6);
    for (const boundary of boundaries) {
      expect(pairClaimExists(boundary.left, boundary.right), `${boundary.left}-${boundary.right}`).toBe(false);
    }
  });

  it('records only parseable shared-context boundaries, not inferred relationships', () => {
    for (const boundary of boundaries) {
      const left = peopleById.get(boundary.left);
      const right = peopleById.get(boundary.right);
      const event = eventById.get(boundary.eventId);
      const detail = eventDetails.find((item) => item.eventId === boundary.eventId);

      expect(left, `${boundary.left}: person endpoint`).toBeDefined();
      expect(right, `${boundary.right}: person endpoint`).toBeDefined();
      expect(event, `${boundary.eventId}: event endpoint`).toBeDefined();
      expect(detail, `${boundary.eventId}: detail endpoint`).toBeDefined();
      expect(detail?.participants.map((participant) => participant.personId)).toEqual(
        expect.arrayContaining([boundary.left, boundary.right]),
      );
      expect(event?.year).toBeDefined();
      expect(event?.endYear === undefined || event.endYear >= event.year).toBe(true);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceIdSet.has(sourceId)), boundary.eventId).toBe(true);
      expect(boundary.reason.trim()).toBeTruthy();
    }
  });
});
