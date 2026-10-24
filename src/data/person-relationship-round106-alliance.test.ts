import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import type { HistoricalClaim } from '../domain/types';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { personDetails } from './person-details';
import { sourceNotes } from './sources';

const integrated = [
  {
    id: 'claim-zhu-yujian-ally-zheng-zhi-long-round106',
    subjectId: 'zhu-yujian',
    predicate: 'ally-of',
    objectId: 'zheng-zhi-long',
    validFrom: 1645,
    validTo: 1646,
    datePrecision: 'range',
    eventId: 'longwu-fuzhou-founded',
    sourceIds: ['southern-ming-overview', 'southern-ming-longwu', 'ming-shi-vol120-southern-ming'],
    uncertaintyNote: '隆武福州阶段，现有事件详情明确记录朱聿键与郑芝龙同处朝廷—东南军政协作链条；郑芝龙同时具有独立军镇网络，本候选只覆盖1645—1646年阶段性合作，不等同于无条件同盟或隆武全期一致立场。',
  },
  {
    id: 'claim-zhu-youlang-ally-qu-shisi-round106',
    subjectId: 'zhu-youlang',
    predicate: 'ally-of',
    objectId: 'qu-shisi',
    validFrom: 1646,
    validTo: 1650,
    datePrecision: 'range',
    eventId: 'yongli-zhaoqing-founded',
    sourceIds: ['southern-ming-overview', 'southern-ming-yongli', 'ming-shi-vol120-southern-ming'],
    uncertaintyNote: '永历肇庆事件详情明确记录朱由榔获得拥立、瞿式耜拥立并辅佐永历政权；本候选只覆盖1646—1650年永历初期政治协作，不能替代具体任职、军镇和后续西南抗清网络的分项记录。',
  },
] as const;

const boundaryPairs = [
  {
    left: 'oxenstierna',
    right: 'trauttmansdorff',
    eventId: 'peace-westphalia',
    reason: '同一多方谈判的代表身份，只证明协商对手/参与者，不直接证明私人或政治同盟。',
  },
  {
    left: 'franklin-roosevelt',
    right: 'harry-truman',
    eventId: 'un-founded',
    reason: '同一国际组织形成链条中的前后政治承接，且罗斯福未参与签署现场，不据共同主题或继承关系补 ally-of。',
  },
  {
    left: 'liu-yan',
    right: 'liu-yin',
    reason: '同一政权谱系和兄弟/继承背景不能自动转为 ally-of；当前关系应由亲属、继承或任职证据分别表达。',
  },
] as const;

const peopleById = new Map(people.map((person) => [person.id, person]));
const detailsByPersonId = new Map(personDetails.map((detail) => [detail.personId, detail]));
const sourceIds = new Set(sourceNotes.map((source) => source.id));
const entityIds = new Set(people.map((person) => person.id));

function pairClaimExists(left: string, right: string): boolean {
  return claims.some((claim) => (
    claim.predicate === 'ally-of' || claim.predicate === 'enemy-of'
  ) && ((claim.subjectId === left && claim.objectId === right)
    || (claim.subjectId === right && claim.objectId === left)));
}

function asClaim(candidate: typeof integrated[number]): HistoricalClaim {
  return {
    id: candidate.id,
    subjectId: candidate.subjectId,
    predicate: candidate.predicate,
    objectId: candidate.objectId,
    validFrom: candidate.validFrom,
    validTo: candidate.validTo,
    datePrecision: candidate.datePrecision,
    perspective: 'person',
    evidenceType: 'cross-checked',
    confidence: 'medium',
    sourceIds: [...candidate.sourceIds],
    uncertaintyNote: candidate.uncertaintyNote,
  };
}

describe('round 106 alliance/conflict boundary audit', () => {
  it('closes exactly the two directly evidenced alliance gaps', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(93);
    for (const candidate of integrated) {
      expect(report.requiredMissingByCategory.allianceConflict).not.toContain(candidate.subjectId);
      expect(report.requiredMissingByCategory.allianceConflict).not.toContain(candidate.objectId);
      expect(pairClaimExists(candidate.subjectId, candidate.objectId), candidate.id).toBe(true);
    }
  });

  it('keeps the two integrated edges source-backed with direct endpoints, dates, and uncertainty', () => {
    expect(integrated.length).toBeLessThanOrEqual(3);

    for (const candidate of integrated) {
      const subject = peopleById.get(candidate.subjectId);
      const object = peopleById.get(candidate.objectId);
      const detail = eventDetails.find((item) => item.eventId === candidate.eventId);
      const subjectDetail = detailsByPersonId.get(candidate.subjectId);
      const objectDetail = detailsByPersonId.get(candidate.objectId);

      expect(subject, `${candidate.id}: subject`).toBeDefined();
      expect(object, `${candidate.id}: object`).toBeDefined();
      expect(candidate.predicate).toMatch(/^(ally-of|enemy-of)$/);
      expect(candidate.validFrom).toBeLessThanOrEqual(candidate.validTo);
      expect(candidate.sourceIds.length).toBeGreaterThan(0);
      expect(candidate.sourceIds.every((sourceId) => sourceIds.has(sourceId)), candidate.id).toBe(true);
      expect(candidate.uncertaintyNote.trim(), candidate.id).toBeTruthy();
      const candidateSourceIds = new Set<string>(candidate.sourceIds);
      expect(subject?.sourceIds.some((sourceId) => candidateSourceIds.has(sourceId)), `${candidate.id}: subject source`).toBe(true);
      expect(object?.sourceIds.some((sourceId) => candidateSourceIds.has(sourceId)), `${candidate.id}: object source`).toBe(true);
      expect(subjectDetail?.keyEvents).toContain(candidate.eventId);
      expect(objectDetail?.keyEvents).toContain(candidate.eventId);
      expect(detail?.participants).toEqual(expect.arrayContaining([
        expect.objectContaining({ personId: candidate.subjectId }),
        expect.objectContaining({ personId: candidate.objectId }),
      ]));
      expect(detail?.sourceIds.some((sourceId) => candidateSourceIds.has(sourceId)), `${candidate.id}: event source`).toBe(true);
      expect(validateClaims([asClaim(candidate)], entityIds), candidate.id).toEqual([]);
    }
  });

  it('keeps shared-event and shared-context pairs outside direct alliance evidence', () => {
    for (const boundary of boundaryPairs) {
      if ('eventId' in boundary) {
        const detail = eventDetails.find((item) => item.eventId === boundary.eventId);
        expect(detail, `${boundary.eventId}: detail`).toBeDefined();
        expect(detail?.participants.map((participant) => participant.personId)).toEqual(
          expect.arrayContaining([boundary.left, boundary.right]),
        );
      }
      expect(pairClaimExists(boundary.left, boundary.right), `${boundary.left}-${boundary.right}`).toBe(false);
      expect(boundary.reason.trim()).toBeTruthy();
    }

    const report = buildPersonRelationshipCoverageReport();
    expect(report.byPersonId['oxenstierna'].categories.allianceConflict.status).toBe('missing');
    expect(report.byPersonId['franklin-roosevelt'].categories.allianceConflict.status).toBe('missing');
    expect(report.byPersonId['liu-yan'].categories.allianceConflict.status).toBe('missing');
  });
});
