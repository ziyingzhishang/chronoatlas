import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { validateClaims } from '../domain/claims';
import { PersonDetail } from '../components/PersonDetail';
import { claims } from './claims';
import { people } from './people';
import { polities } from './polities';
import { personDetails, getPersonDetail } from './person-details';
import { sourceNotes } from './sources';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';

const batchIds = [
  'claim-duan-ye-ruled-northern-liang-ninetysecond',
  'claim-namri-songtsen-ruled-tibetan-empire-ninetysecond',
] as const;

describe('ninety-second batch high-confidence governance relationships', () => {
  it('keeps both new governance edges source-backed, time-valid, and resolvable', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const detailIds = new Set(personDetails.map((detail) => detail.personId));
    const batchClaims = claims.filter((claim) => batchIds.includes(claim.id as typeof batchIds[number]));

    expect(batchClaims).toHaveLength(2);
    expect(validateClaims(batchClaims, new Set([...peopleIds, ...polityIds]))).toEqual([]);
    for (const claim of batchClaims) {
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(polityIds.has(claim.objectId ?? ''), claim.id).toBe(true);
      expect(detailIds.has(claim.subjectId), claim.id).toBe(true);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.confidence, claim.id).toBe('high');
      expect(claim.evidenceType, claim.id).not.toBe('inference');
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
    }
  });

  it('closes only the two evidenced governance gaps and leaves other categories unchanged', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.governance).toHaveLength(31);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(114);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(85);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(13);
    for (const personId of ['duan-ye', 'namri-songtsen']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
  });

  it('navigates from each person detail to the related polity', () => {
    for (const [personId, polityId, polityName] of [
      ['duan-ye', 'northern_liang', '北凉'],
      ['namri-songtsen', 'tibetan_empire', '吐蕃'],
    ] as const) {
      const onOpenEntity = vi.fn();
      render(
        <PersonDetail
          person={people.find((person) => person.id === personId)!}
          detail={getPersonDetail(personId)!}
          year={personId === 'duan-ye' ? 399 : 620}
          claims={claims}
          people={people}
          polities={polities}
          onOpenEntity={onOpenEntity}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: new RegExp(`统治 · ${polityName}`) }));
      expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: polityId });
    }
  });
});
