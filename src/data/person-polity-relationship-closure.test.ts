import { describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { personDetails } from './person-details';
import { polities } from './polities';
import { sourceNotes } from './sources';

const expected = [
  ['claim-chu-we-wang-ruled-chu-warring-closure', 'chu-we-wang', 'chu_warring', -339, -329, ['zizhi-tongjian', 'china-chronology']],
  ['claim-yan-zhaowang-ruled-yan-warring-closure', 'yan-zhaowang', 'yan_warring', -311, -279, ['zizhi-tongjian', 'china-chronology']],
  ['claim-qi-we-wang-ruled-qi-warring-closure', 'qi-we-wang', 'qi_warring', -356, -320, ['zizhi-tongjian', 'china-chronology']],
  ['claim-qin-shi-huang-ruled-qin-closure', 'qin-shi-huang', 'qin', -246, -210, ['zizhi-tongjian', 'china-chronology']],
  ['claim-liu-xiu-ruled-han-eastern-closure', 'liu-xiu', 'han_eastern', 25, 57, ['zizhi-tongjian']],
  ['claim-cao-cao-ruled-wei-three-closure', 'cao-cao', 'wei_three', 208, 220, ['zizhi-tongjian', 'china-chronology']],
  ['claim-liu-bei-ruled-shu-three-closure', 'liu-bei', 'shu_three', 221, 223, ['zizhi-tongjian', 'china-chronology']],
  ['claim-fu-jian-ruled-former-qin-closure', 'fu-jian', 'former_qin', 357, 385, ['zizhi-tongjian']],
  ['claim-li-cunxu-ruled-tang-later-closure', 'li-cunxu', 'tang_later', 923, 926, ['zizhi-tongjian']],
  ['claim-murong-tuyuhun-ruled-tuyuhun-closure', 'murong-tuyuhun', 'tuyuhun', 313, 317, ['zizhi-tongjian', 'china-chronology']],
  ['claim-asina-tumen-ruled-turkic-closure', 'asina-tumen', 'turkic', 552, 553, ['turkic-history-db', 'china-chronology']],
  ['claim-wu-zhao-ruled-wu-zhou-closure', 'wu-zhao', 'wu_zhou', 690, 705, ['zizhi-tongjian']],
  ['claim-lv-guang-ruled-later-liang-closure', 'lv-guang', 'later_liang', 386, 399, ['zizhi-tongjian', 'china-chronology']],
  ['claim-tufa-wugu-founded-southern-liang-closure', 'tufa-wugu', 'southern_liang', 397, 397, ['zizhi-tongjian', 'china-chronology']],
  ['claim-li-hao-ruled-western-liang-closure', 'li-hao', 'western_liang', 400, 417, ['zizhi-tongjian', 'china-chronology']],
  ['claim-kublai-ruled-yuan-closure', 'kublai', 'yuan', 1271, 1294, ['yuan-nationalities-history', 'yuan-li-bingzhong']],
  ['claim-gao-jixing-ruled-jingnan-closure', 'gao-jixing', 'jingnan', 924, 929, ['zizhi-tongjian', 'china-chronology']],
] as const;

describe('person–polity relationship closure batch', () => {
  it('keeps all 17 explicit governance edges resolvable, sourced, and time-valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const selected = claims.filter((claim) => expected.some(([id]) => id === claim.id));

    expect(selected).toHaveLength(expected.length);
    expect(validateClaims(selected, new Set([...peopleIds, ...polityIds]))).toEqual([]);

    for (const [id, subjectId, objectId, validFrom, validTo, requiredSources] of expected) {
      const claim = selected.find((item) => item.id === id);
      expect(claim).toMatchObject({
        subjectId,
        predicate: expect.stringMatching(/^(founded|ruled)$/),
        objectId,
        validFrom,
        validTo,
        perspective: 'person',
      });
      expect(claim?.sourceIds).toEqual(expect.arrayContaining([...requiredSources]));
      expect(claim?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), id).toBe(true);
      expect(claim?.evidenceType).not.toBe('inference');
      expect(claim?.confidence).toBe('high');
      expect(claim?.uncertaintyNote?.trim(), id).toBeTruthy();
    }
  });

  it('exposes a resolvable Southern Liang person link', () => {
    const tufaWugu = people.find((person) => person.id === 'tufa-wugu');
    expect(tufaWugu?.polityIds).toContain('southern_liang');
    expect(personDetails.some((detail) => detail.personId === 'tufa-wugu')).toBe(true);
    expect(claims.some((claim) => claim.subjectId === 'tufa-wugu' && claim.objectId === 'southern_liang')).toBe(true);
  });
});
