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
  { id: 'claim-qin-xiaogong-ruled-qin-state-ninetyfifth', subjectId: 'qin-xiaogong', objectId: 'qin_state', validFrom: -361, validTo: -338 },
  { id: 'claim-liu-yilong-ruled-liu-song-ninetyfifth', subjectId: 'liu-yilong', objectId: 'song_southern', validFrom: 424, validTo: 453 },
  { id: 'claim-chen-xu-ruled-southern-chen-ninetyfifth', subjectId: 'chen-xu', objectId: 'chen_southern', validFrom: 569, validTo: 582 },
] as const;

describe('ninety-fifth batch Qin Han Northern and Southern Dynasties governance relationships', () => {
  it('keeps each governance edge source-backed, time-valid, and resolvable', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const detailIds = new Set(personDetails.map((detail) => detail.personId));
    const selected = claims.filter((claim) => batchClaims.some((item) => item.id === claim.id));

    expect(selected).toHaveLength(batchClaims.length);
    expect(validateClaims(selected, new Set([...peopleIds, ...polityIds]))).toEqual([]);
    for (const expected of batchClaims) {
      const claim = selected.find((item) => item.id === expected.id)!;
      const person = people.find((item) => item.id === expected.subjectId)!;
      const detail = getPersonDetail(expected.subjectId)!;
      expect(person.birthYear).toBeDefined();
      expect(person.deathYear).toBeDefined();
      expect(peopleIds.has(claim.subjectId), claim.id).toBe(true);
      expect(polityIds.has(claim.objectId ?? ''), claim.id).toBe(true);
      expect(detailIds.has(claim.subjectId), claim.id).toBe(true);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claim.id).toBe(true);
      expect(claim.predicate, claim.id).toBe('ruled');
      expect(claim.confidence, claim.id).toBe('high');
      expect(claim.evidenceType, claim.id).not.toBe('inference');
      expect(claim.validFrom).toBe(expected.validFrom);
      expect(claim.validTo).toBe(expected.validTo);
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

  it('closes exactly the three audited governance gaps without changing other categories', () => {
    const report = buildPersonRelationshipCoverageReport();

    expect(report.requiredMissingByCategory.governance).toHaveLength(37);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(144);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(90);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(16);
    for (const personId of ['qin-xiaogong', 'liu-yilong', 'chen-xu']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
  });

  it('navigates from each person detail to the related polity', () => {
    for (const [personId, polityId, polityName, year] of [
      ['qin-xiaogong', 'qin_state', '秦国', -350],
      ['liu-yilong', 'song_southern', '刘宋', 430],
      ['chen-xu', 'chen_southern', '南陈', 575],
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
