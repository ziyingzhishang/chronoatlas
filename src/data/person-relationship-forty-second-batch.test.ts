import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-tuoba-gui-parent-tuoba-si-fortysecond': ['tuoba-gui', 'parent-of', 'tuoba-si', 392, 409],
  'claim-tuoba-si-child-tuoba-gui-fortysecond': ['tuoba-si', 'child-of', 'tuoba-gui', 392, 409],
  'claim-jumong-parent-yuri-goguryeo-fortysecond': ['jumong', 'parent-of', 'yuri-goguryeo', -37, 18],
  'claim-yuri-goguryeo-child-jumong-fortysecond': ['yuri-goguryeo', 'child-of', 'jumong', -37, 18],
  'claim-park-hyeokgeose-parent-namhae-fortysecond': ['park-hyeokgeose', 'parent-of', 'namhae-chachaung', -57, 4],
  'claim-namhae-child-park-hyeokgeose-fortysecond': ['namhae-chachaung', 'child-of', 'park-hyeokgeose', -57, 24],
  'claim-yuri-goguryeo-parent-daemusin-fortysecond': ['yuri-goguryeo', 'parent-of', 'daemusin', 4, 18],
  'claim-daemusin-child-yuri-goguryeo-fortysecond': ['daemusin', 'child-of', 'yuri-goguryeo', 4, 18],
  'claim-murong-chui-sibling-murong-de-fortysecond': ['murong-chui', 'sibling-of', 'murong-de', 336, 396],
  'claim-liu-yin-sibling-liu-yan-fortysecond': ['liu-yin', 'sibling-of', 'liu-yan', 904, 911],
  'claim-kublai-sibling-mongke-fortysecond': ['kublai', 'sibling-of', 'mongke', 1215, 1259],
  'claim-hongtaiji-child-nurhaci-fortysecond': ['hongtaiji', 'child-of', 'nurhaci', 1592, 1626],
  'claim-shunzhi-child-hongtaiji-fortysecond': ['shunzhi', 'child-of', 'hongtaiji', 1638, 1643],
} as const;

describe('forty-second batch high-confidence person relationships', () => {
  it('adds only the approved relationship directions and time ranges', () => {
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo]] of Object.entries(expectedRelations)) {
      const claim = claims.find((item) => item.id === claimId);
      expect(claim, claimId).toBeDefined();
      expect(claim).toMatchObject({
        subjectId,
        predicate,
        objectId,
        validFrom,
        validTo,
        perspective: 'person',
        confidence: 'high',
      });
    }
  });

  it('keeps every new claim explicit, source-backed, uncertain where appropriate, and resolvable', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const batchClaims = claims.filter((claim) => claim.id.endsWith('-fortysecond'));

    expect(batchClaims).toHaveLength(Object.keys(expectedRelations).length);
    expect(validateClaims(batchClaims, peopleIds)).toEqual([]);
    for (const claim of batchClaims) {
      expect(['explicit-record', 'cross-checked']).toContain(claim.evidenceType);
      expect(['parent-of', 'child-of', 'sibling-of']).toContain(claim.predicate);
      expect(claim.sourceIds.length, claim.id).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
    }
  });
});
