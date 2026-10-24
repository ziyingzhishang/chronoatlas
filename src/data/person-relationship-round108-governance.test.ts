import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { personDetails } from './person-details';
import { polities } from './polities';
import { sourceNotes } from './sources';

const requiredMissingGovernance = [
  'liu-zhuang', 'fu-jian-founder', 'zhang-qian', 'ban-gu', 'du-fu', 'yelu-deguang', 'shengzong-liao', 'xingzong-liao', 'shi-zhi', 'huan-wen', 'ma-xiguang', 'ma-xie', 'yu-the-great', 'ogedei', 'jamukha', 'chiang-kai-shek', 'deng-ai', 'zhong-hui', 'lushangzan', 'han-kangzi',
  'zhao-xiangzi', 'wei-huanzi', 'zhizhi-chanyu', 'xiongnu-northern-chanyu-91', 'dou-xian', 'liu-yuan', 'seondeok-silla', 'jindeok-silla', 'kim-yushin', 'ilai-khagan', 'qapaghan', 'kul-tegin', 'ozmish-khagan', 'istemi', 'zhang-gui', 'wang-sengbian', 'li-gang',
  'zong-ze', 'helian-ding', 'zheng-maisi', 'octavian', 'mark-antony', 'constantine-xi', 'mehmed-ii',
  'guacanagari', 'oxenstierna', 'trauttmansdorff', 'chigi', 'franklin-roosevelt', 'wang-yenxi', 'yeon-gaesomun', 'yeon-namsaeng', 'yeon-namgeon',
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

    expect(eligibleOffices.map(({ personId }) => personId)).toEqual(['liu-zhuang', 'fu-jian-founder', 'yelu-deguang', 'shengzong-liao', 'xingzong-liao', 'shi-zhi', 'ogedei', 'zhizhi-chanyu', 'xiongnu-northern-chanyu-91', 'liu-yuan', 'ilai-khagan', 'qapaghan', 'ozmish-khagan', 'helian-ding']);
  });
});
