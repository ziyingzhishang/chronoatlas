import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { sourceById } from './sources';

const targetPhases = {
  'an-lushan-rebellion': { label: '中央恢复与河北军镇并行', startYear: 763, endYear: 780 },
  'chu-han-contention': { label: '汉主导秩序的初步承接', startYear: -202, endYear: -202 },
  'eastern-jin': { label: '江南晋室与北方分裂并行', startYear: 317, endYear: 323 },
  'qin-state-founded-eighth-batch': { label: '列侯名义与秦国形成分离', startYear: -770, endYear: -350 },
  'xia-early-founded-eighth-batch': { label: '传统起点与考古参照并行', startYear: -2070, endYear: -1600 },
  'shang-founded-eighth-batch': { label: '晚商材料窗口与早期分期区分', startYear: -1300, endYear: -1047 },
} as const;

const targetConsequences = {
  'an-lushan-rebellion': '主要叛乱结束后，唐廷恢复的是名义秩序与部分交通节点；河北军镇承接使中央复归和地方直接控制不能视作同一结果。',
  'chu-han-contention': '前202年项羽败亡后，汉方取得主导地位，但诸侯分封、关中后方与地方军政承接仍是后续过程。',
  'eastern-jin': '317—318年的晋室重建保留的是江南政治承接；北方旧晋空间的控制与人口、军镇关系不能由建康即位节点一次性推出。',
  'qin-state-founded-eighth-batch': '秦列为诸侯确认的是传统分期与名义身份；秦氏早期经营、都邑迁移和战国强国化属于后续过程，不能回填为前770年已形成帝国式控制。',
  'xia-early-founded-eighth-batch': '二里头等考古材料能够提供早期都邑与王权形成的参照，但不能把考古文化、夏代国号和约前2070年的国家边界互相替代。',
  'shang-founded-eighth-batch': '晚商甲骨文和都邑材料提供较丰富的可观察窗口，但不能把盘庚迁殷或武丁时期的证据前推为约前1600年的建政现场。',
} as const;

const targetParticipantNotes = {
  'an-lushan-rebellion': { personId: 'an-lushan', note: '安禄山对应755年起兵节点，不代表763年主要叛乱结束后的史思明、史朝义等后续叛军阶段；叛乱首领与战后藩镇承接需分开。' },
  'chu-han-contention': { personId: 'liu-bang', note: '刘邦代表汉方核心主线，不覆盖项羽一方、诸侯分封或楚汉战争全部参与者。' },
  'eastern-jin': { personId: 'sima-rui', note: '司马睿代表317年即晋王位与318年即皇帝位的晋室重建节点，不代表江东全部军政力量或北方旧晋地区。' },
  'qin-state-founded-eighth-batch': { personId: 'qin-mugong', note: '秦穆公晚于约前770年的列侯节点，本条只用其代表秦国后续扩张与国家整合，不作为秦国传统分期起点的当事人。' },
  'xia-early-founded-eighth-batch': { personId: 'yu-the-great', note: '禹属于传统夏代建政叙事的核心人物，不以传说人物证明约前2070年存在可精确核验的单日建国。' },
  'shang-founded-eighth-batch': { personId: 'wu-ding', note: '武丁属于晚商甲骨文材料较丰富的代表君主，不把其统治前推为约前1600年的商代建政者。' },
} as const;

describe('event details seventy-fourth batch', () => {
  it('adds source-backed stages without upgrading uncertain time precision', () => {
    const report = buildEventDetailCoverageReport();
    const eventsById = new Map(events.map((event) => [event.id, event]));

    Object.entries(targetPhases).forEach(([eventId, expectedPhase]) => {
      const event = eventsById.get(eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      const item = report.items.find((candidate) => candidate.eventId === eventId);

      expect(event, eventId).toBeDefined();
      expect(event?.datePrecision, eventId).toBe(['an-lushan-rebellion', 'chu-han-contention', 'eastern-jin'].includes(eventId) ? 'range' : 'approximate');
      expect(report.needsReviewEventIds, eventId).toContain(eventId);
      expect(item?.sourceComplete, eventId).toBe(true);
      expect(item?.unresolvedReferenceIds, eventId).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
      expect(detail?.participants.length, eventId).toBeGreaterThan(0);
      expect(detail?.causes.length, eventId).toBeGreaterThanOrEqual(2);
      expect(detail?.consequences.length, eventId).toBeGreaterThanOrEqual(3);
      expect(detail?.phases).toEqual(expect.arrayContaining([expect.objectContaining(expectedPhase)]));
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), eventId).toBe(true);
      expect(detail?.uncertaintyNote?.trim(), eventId).toBeTruthy();
    });
  });

  it('keeps impact statements and participant scopes bounded by existing evidence', () => {
    const byId = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    Object.entries(targetConsequences).forEach(([eventId, consequence]) => {
      expect(byId.get(eventId)?.consequences, eventId).toContain(consequence);
    });

    Object.entries(targetParticipantNotes).forEach(([eventId, expectedParticipant]) => {
      expect(byId.get(eventId)?.participants, eventId).toEqual(expect.arrayContaining([
        expect.objectContaining({
          personId: expectedParticipant.personId,
          note: expect.stringContaining(expectedParticipant.note),
        }),
      ]));
    });
  });
});
