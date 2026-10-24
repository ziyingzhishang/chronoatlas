import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { validateClaims } from '../domain/claims';
import { PersonDetail } from '../components/PersonDetail';
import { claims } from './claims';
import { people } from './people';
import { polities } from './polities';
import { getPersonDetail, personDetails } from './person-details';
import { sourceNotes } from './sources';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

const batchClaims = [
  { id: 'claim-songtsen-gampo-enemy-li-shimin-ninetyfourth', subjectId: 'songtsen-gampo', objectId: 'li-shimin', predicate: 'enemy-of', validFrom: 638, validTo: 641 },
  { id: 'claim-murong-huang-enemy-shi-hu-ninetyfourth', subjectId: 'murong-huang', objectId: 'shi-hu', predicate: 'enemy-of', validFrom: 338, validTo: 339 },
  { id: 'claim-chen-qian-enemy-yuwen-yong-ninetyfourth', subjectId: 'chen-qian', objectId: 'yuwen-yong', predicate: 'enemy-of', validFrom: 562, validTo: 566 },
] as const;

describe('ninety-fourth batch high-confidence alliance and conflict relationships', () => {
  it('keeps exactly three explicit, source-backed enemy edges with person endpoints', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const detailIds = new Set(personDetails.map((detail) => detail.personId));
    const selected = claims.filter((claim) => batchClaims.some((item) => item.id === claim.id));

    expect(selected).toHaveLength(3);
    expect(validateClaims(selected, peopleIds)).toEqual([]);
    for (const expected of batchClaims) {
      const claim = selected.find((item) => item.id === expected.id)!;
      expect(claim.subjectId).toBe(expected.subjectId);
      expect(claim.objectId).toBe(expected.objectId);
      expect(claim.predicate).toBe('enemy-of');
      expect(peopleIds.has(claim.subjectId)).toBe(true);
      expect(peopleIds.has(claim.objectId ?? '')).toBe(true);
      expect(detailIds.has(claim.subjectId)).toBe(true);
      expect(detailIds.has(claim.objectId ?? '')).toBe(true);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(claim.confidence).toBe('high');
      expect(claim.evidenceType).not.toBe('inference');
      expect(claim.validFrom).toBe(expected.validFrom);
      expect(claim.validTo).toBe(expected.validTo);
      expect(claim.uncertaintyNote?.trim()).toBeTruthy();
    }
  });

  it('reduces only the three audited alliance-conflict gaps and does not use participation claims', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(83);
    expect(report.requiredMissingByCategory.governance).toHaveLength(33);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(138);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(11);
    for (const personId of ['songtsen-gampo', 'murong-huang', 'chen-qian']) {
      expect(report.byPersonId[personId].categories.allianceConflict.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('allianceConflict');
    }
  });

  it('navigates from each subject PersonDetail to the opposing person', () => {
    for (const [personId, targetId, targetName, year] of [
      ['songtsen-gampo', 'li-shimin', '李世民', 638],
      ['murong-huang', 'shi-hu', '石虎', 338],
      ['chen-qian', 'yuwen-yong', '宇文邕', 562],
    ] as const) {
      const onOpenEntity = vi.fn();
      render(
        <PersonDetail
          person={people.find((person) => person.id === personId)!}
          detail={getPersonDetail(personId)!}
          year={year}
          claims={claims}
          people={people}
          polities={polities}
          onOpenEntity={onOpenEntity}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: new RegExp(`对立 · ${targetName}`) }));
      expect(onOpenEntity).toHaveBeenCalledWith({ type: 'person', id: targetId });
    }
  });
});
