import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { getPolityDetail } from './polity-details';

const expected = {
  wei_three: ['claim-cao-cao-ruled-wei-three-closure'],
  shu_three: ['claim-liu-bei-ruled-shu-three-closure'],
  wu_three: ['claim-sun-quan-ruled-wu-fiftyninth'],
  yuan: ['claim-kublai-ruled-yuan-closure'],
  ming: ['claim-zhu-yuanzhang-ruled-ming-sixtysecond'],
  qing: ['claim-hongtaiji-ruled-qing-fiftysixth', 'claim-shunzhi-ruled-qing-fiftysixth'],
  goguryeo: ['claim-jumong-ruled-goguryeo-fiftyninth', 'claim-daemusin-ruled-goguryeo-fiftyseventh'],
  northern_yuan: ['claim-tuotuobuhua-ruled-northern-yuan', 'claim-toghon-temur-ruled-northern-yuan-ninetythird'],
} as const;

describe('polity detail relationship closure', () => {
  it('exposes directly sourced person-to-polity rule claims in the polity detail graph', () => {
    for (const [polityId, claimIds] of Object.entries(expected)) {
      const detail = getPolityDetail(polityId);
      expect(detail, polityId).toBeDefined();
      for (const claimId of claimIds) {
        expect(detail?.claimIds, `${polityId}:${claimId}`).toContain(claimId);
        const claim = claims.find((candidate) => candidate.id === claimId);
        expect(claim?.objectId, claimId).toBe(polityId);
        expect(claim?.sourceIds.length, claimId).toBeGreaterThan(0);
      }
    }
  });
});
