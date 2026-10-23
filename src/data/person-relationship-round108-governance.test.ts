import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { personDetails } from './person-details';
import { polities } from './polities';
import { sourceNotes } from './sources';

const requiredMissingGovernance = [
  'liu-zhuang', 'fu-jian-founder', 'zhang-qian', 'ban-gu', 'du-fu', 'yelu-deguang', 'shengzong-liao', 'xingzong-liao', 'yu-the-great', 'jamukha', 'chiang-kai-shek', 'han-kangzi',
  'zhao-xiangzi', 'wei-huanzi', 'seondeok-silla', 'jindeok-silla', 'kim-yushin', 'istemi', 'zhang-gui', 'wang-sengbian', 'li-gang',
  'zong-ze', 'octavian', 'mark-antony', 'constantine-xi', 'mehmed-ii',
  'guacanagari', 'oxenstierna', 'trauttmansdorff', 'chigi', 'franklin-roosevelt',
] as const;

const explicitRulerTitle = /皇帝|君主|国王|可汗|大汗|单于|汗|赞普|南诏王|苏丹|诸侯/;

describe('round 108 governance boundary audit', () => {
  it('keeps the 28 remaining required governance gaps stable', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.requiredMissingByCategory.governance).toEqual(requiredMissingGovernance);
    expect(claims.filter((claim) => claim.id.endsWith('-round108'))).toEqual([]);
  });

  it('finds no office with an explicit ruler title, valid polity endpoint, valid dates, and parseable sources', () => {
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const eligibleOffices = requiredMissingGovernance.flatMap((personId) => (
      personDetails.find((item) => item.personId === personId)?.offices
        .filter((office) => (
          explicitRulerTitle.test(office.title)
          && office.polityId !== undefined
          && polityIds.has(office.polityId)
          && office.validFrom !== undefined
          && office.validTo !== undefined
          && office.validFrom <= office.validTo
          && office.sourceIds.every((sourceId) => sourceIds.has(sourceId))
        ))
        .map((office) => ({ personId, office })) ?? []
    ));

    expect(eligibleOffices.map(({ personId }) => personId)).toEqual(['liu-zhuang', 'fu-jian-founder', 'yelu-deguang', 'shengzong-liao', 'xingzong-liao']);
  });
});
