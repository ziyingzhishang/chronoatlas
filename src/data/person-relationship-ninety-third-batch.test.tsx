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

const batchClaims = [
  { id: 'claim-toghon-temur-ruled-northern-yuan-ninetythird', subjectId: 'toghon-temur', objectId: 'northern_yuan', validFrom: 1333, validTo: 1370 },
  { id: 'claim-sun-yat-sen-ruled-republic-ninetythird', subjectId: 'sun-yat-sen', objectId: 'republic', validFrom: 1912, validTo: 1912 },
  { id: 'claim-mao-zedong-ruled-prc-ninetythird', subjectId: 'mao-zedong', objectId: 'prc', validFrom: 1949, validTo: 1976 },
] as const;

describe('ninety-third batch high-confidence governance relationships', () => {
  it('keeps each governance edge source-backed, time-valid, and resolvable', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const detailIds = new Set(personDetails.map((detail) => detail.personId));
    const selected = claims.filter((claim) => batchClaims.some((item) => item.id === claim.id));

    expect(selected).toHaveLength(batchClaims.length);
    expect(validateClaims(selected, new Set([...peopleIds, ...polityIds]))).toEqual([]);
    for (const claim of selected) {
      const detail = getPersonDetail(claim.subjectId)!;
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(polityIds.has(claim.objectId ?? ''), claim.id).toBe(true);
      expect(detailIds.has(claim.subjectId), claim.id).toBe(true);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.predicate, claim.id).toBe('ruled');
      expect(claim.confidence, claim.id).toBe('high');
      expect(claim.evidenceType, claim.id).not.toBe('inference');
      expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
      expect(claim.uncertaintyNote?.trim(), claim.id).toBeTruthy();
      expect(detail.offices, claim.id).toEqual(expect.arrayContaining([
        expect.objectContaining({
          polityId: claim.objectId,
          validFrom: claim.validFrom,
          validTo: claim.validTo,
          sourceIds: expect.arrayContaining(claim.sourceIds),
        }),
      ]));
    }
  });

  it('closes only the three evidenced governance gaps', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.governance).toHaveLength(33);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(127);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(84);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(10);
    for (const personId of ['toghon-temur', 'sun-yat-sen', 'mao-zedong']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
  });

  it('navigates from each person detail to the related polity', () => {
    for (const [personId, polityId, polityName, year] of [
      ['toghon-temur', 'northern_yuan', '北元', 1368],
      ['sun-yat-sen', 'republic', '中华民国（大陆时期）', 1912],
      ['mao-zedong', 'prc', '中华人民共和国', 1949],
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

      fireEvent.click(screen.getByRole('button', { name: new RegExp(`统治 · ${polityName}`) }));
      expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: polityId });
    }
  });
});
