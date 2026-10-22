import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { validateClaims } from '../domain/claims';
import { groupPersonRelationships } from '../domain/relationships';
import { PersonDetail } from '../components/PersonDetail';
import { claims } from './claims';
import { people } from './people';
import { personDetails, getPersonDetail } from './person-details';
import { sourceNotes } from './sources';

const personIds = new Set(people.map((person) => person.id));
const sourceIds = new Set(sourceNotes.map((source) => source.id));
const detailIds = new Set(personDetails.map((detail) => detail.personId));
const personPersonPredicates = new Set([
  'parent-of', 'child-of', 'grandparent-of', 'grandchild-of', 'sibling-of', 'spouse-of',
  'teacher-of', 'student-of', 'served', 'appointed', 'ally-of', 'enemy-of',
  'related-to',
]);

describe('eighty-ninth batch person relationship audit', () => {
  it('keeps every high-confidence person relationship resolvable in the graph and detail model', () => {
    const highConfidenceClaims = claims.filter((claim) => (
      claim.perspective === 'person'
      && claim.confidence === 'high'
      && personPersonPredicates.has(claim.predicate)
      && personIds.has(claim.subjectId)
      && personIds.has(claim.objectId ?? '')
    ));

    expect(highConfidenceClaims.length).toBeGreaterThan(0);
    expect(validateClaims(highConfidenceClaims, personIds)).toEqual([]);
    for (const claim of highConfidenceClaims) {
      expect(detailIds.has(claim.subjectId), `${claim.id} subject detail`).toBe(true);
      expect(detailIds.has(claim.objectId ?? ''), `${claim.id} object detail`).toBe(true);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(groupPersonRelationships(claim.subjectId, claim.validFrom ?? 0, [claim])['person-person'], claim.id).toHaveLength(1);
    }
  });

  it('freezes three review boundaries instead of promoting inference to a relationship', () => {
    const yuanHongTuobaTao = claims.filter((claim) => (
      [claim.subjectId, claim.objectId].includes('yuan-hong')
      && [claim.subjectId, claim.objectId].includes('tuoba-tao')
      && personPersonPredicates.has(claim.predicate)
    ));
    expect(yuanHongTuobaTao).toHaveLength(1);
    expect(yuanHongTuobaTao[0]).toMatchObject({
      predicate: 'related-to',
      confidence: 'medium',
      evidenceType: 'cross-checked',
    });

    const zhaoWulingQinShihuang = claims.filter((claim) => (
      [claim.subjectId, claim.objectId].includes('zhao-wuling')
      && [claim.subjectId, claim.objectId].includes('qin-shi-huang')
    ));
    expect(zhaoWulingQinShihuang).toHaveLength(1);
    expect(zhaoWulingQinShihuang[0]).toMatchObject({
      predicate: 'related-to',
      confidence: 'low',
      evidenceType: 'inference',
    });

    const liZhiLiLongji = claims.filter((claim) => (
      [claim.subjectId, claim.objectId].includes('li-zhi')
      && [claim.subjectId, claim.objectId].includes('li-longji')
      && ['parent-of', 'child-of'].includes(claim.predicate)
    ));
    expect(liZhiLiLongji).toHaveLength(2);
    expect(liZhiLiLongji.every((claim) => claim.confidence === 'high')).toBe(true);
  });

  it('opens the related person from a sourced claim in PersonDetail', () => {
    const liZhi = people.find((person) => person.id === 'li-zhi')!;
    const onOpenEntity = vi.fn();

    render(
      <PersonDetail
        person={liZhi}
        detail={getPersonDetail('li-zhi')!}
        year={640}
        claims={claims}
        people={people}
        onOpenEntity={onOpenEntity}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /子女.*李世民/ }));
    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'person', id: 'li-shimin' });
  });
});
