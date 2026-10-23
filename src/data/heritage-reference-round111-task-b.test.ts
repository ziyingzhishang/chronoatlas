import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

const candidates = [
  'taiji-palace-site',
  'hanguang-gate-site',
  'mingde-gate-site',
  'dingding-gate-site',
  'qianling',
  'ximing-temple-site',
] as const;

const expectedReasons: Record<(typeof candidates)[number], string> = {
  'taiji-palace-site': '隋唐叠压层',
  'hanguang-gate-site': '隋唐叠压层',
  'mingde-gate-site': '隋唐叠压层',
  'dingding-gate-site': '隋唐叠压层',
  qianling: '唐武周共享',
  'ximing-temple-site': '约址；西明寺专属事件已建立，统一译经事件仍待核',
};

describe('round 111 task B Sui-Tang capital heritage boundary', () => {
  it('audits every requested candidate against the capital-stage endpoints', () => {
    const sui = getPolityDetail('sui');
    const tang = getPolityDetail('tang');

    expect(candidates).toHaveLength(6);
    for (const heritageId of candidates) {
      const asset = heritageAssets.find((item) => item.id === heritageId);
      const detail = getHeritageDetail(heritageId);

      expect(asset, heritageId).toBeDefined();
      expect(detail, heritageId).toBeDefined();
      expect(asset?.placeId, heritageId).toBeDefined();
      expect(asset?.constructionFrom, heritageId).toBeDefined();
      expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId]), heritageId).toBe(true);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), heritageId).toBe(true);
      expect(detail?.associatedPolities.length, heritageId).toBeGreaterThan(0);
      expect(expectedReasons[heritageId]).toBeTruthy();
    }

    expect(sui?.heritageIds).not.toEqual(expect.arrayContaining([...candidates]));
    expect(tang?.heritageIds).not.toEqual(expect.arrayContaining([...candidates]));
  });

  it('keeps shared and uncertain layers out of a forced single-polity closure', () => {
    expect(getHeritageDetail('taiji-palace-site')?.associatedPolities).toEqual(['sui', 'tang']);
    expect(getHeritageDetail('hanguang-gate-site')?.associatedPolities).toEqual(['sui', 'tang']);
    expect(getHeritageDetail('mingde-gate-site')?.associatedPolities).toEqual(['sui', 'tang']);
    expect(getHeritageDetail('dingding-gate-site')?.associatedPolities).toEqual(['sui', 'tang']);
    expect(getHeritageDetail('qianling')?.associatedPolities).toEqual(['tang', 'wu_zhou']);
    expect(getHeritageDetail('shangyang-palace-site')?.associatedPolities).toEqual(['tang', 'wu_zhou']);

    const ximing = getHeritageDetail('ximing-temple-site');
    expect(ximing?.associatedPolities).toEqual(['tang']);
    expect(ximing?.uncertaintyNote).toContain('约址');
    expect(ximing?.uncertaintyNote).toContain('译经事件端点');
    expect(ximing?.associatedEvents).toEqual(expect.arrayContaining(['ximing-temple-built', 'xuanzang-at-ximing-658', 'xuanzang-translations']));
    expect(ximing?.constructionHistory.some((phase) => phase.from === 656 && phase.to === 907)).toBe(true);
  });

  it('confirms the candidate years overlap their claimed capital stages without treating overlap as proof', () => {
    for (const heritageId of candidates) {
      const asset = heritageAssets.find((item) => item.id === heritageId)!;
      if (asset.constructionFrom === undefined) {
        throw new Error(`${heritageId} is missing constructionFrom`);
      }
      const constructionFrom = asset.constructionFrom;
      const terms = capitalHistory.filter((term) => (
        term.placeId === asset.placeId && term.polityId !== undefined
        && term.validFrom <= (asset.constructionTo ?? constructionFrom)
        && term.validTo >= constructionFrom
      ));

      expect(terms.length, heritageId).toBeGreaterThan(0);
    }
  });
});
