import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PersonDetail } from '../components/PersonDetail';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { people } from './people';
import { polities } from './polities';
import { getPersonDetail, personDetails } from './person-details';
import { sourceNotes } from './sources';

const batchClaims = [
  { id: 'claim-qi-we-wang-ruled-qi-warring-ninetythird', subjectId: 'qi-we-wang', objectId: 'qi_warring', validFrom: -356, validTo: -320 },
  { id: 'claim-qin-xiaogong-ruled-qin-state-ninetythird', subjectId: 'qin-xiaogong', objectId: 'qin_state', validFrom: -361, validTo: -338 },
  { id: 'claim-liu-yilong-ruled-liu-song-ninetythird', subjectId: 'liu-yilong', objectId: 'song_southern', validFrom: 424, validTo: 453 },
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
    for (const expected of batchClaims) {
      const claim = selected.find((item) => item.id === expected.id)!;
      const person = people.find((item) => item.id === expected.subjectId)!;
      const polity = polities.find((item) => item.id === expected.objectId)!;
      const detail = getPersonDetail(expected.subjectId)!;
      expect(claim).toMatchObject({ subjectId: expected.subjectId, predicate: 'ruled', objectId: expected.objectId, validFrom: expected.validFrom, validTo: expected.validTo, datePrecision: 'range', perspective: 'person', evidenceType: 'explicit-record', confidence: 'high', sourceIds: ['zizhi-tongjian', 'china-chronology'] });
      expect(detailIds.has(claim.subjectId)).toBe(true);
      expect(person.birthYear === undefined || person.birthYear <= expected.validFrom).toBe(true);
      expect(person.deathYear === undefined || person.deathYear >= expected.validTo).toBe(true);
      expect(detail.offices).toEqual(expect.arrayContaining([expect.objectContaining({ polityId: expected.objectId, validFrom: expected.validFrom, validTo: expected.validTo, sourceIds: ['zizhi-tongjian', 'china-chronology'] })]));
      expect(polity.startYear).toBeLessThanOrEqual(expected.validFrom);
      expect(polity.endYear).toBeGreaterThanOrEqual(expected.validTo);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(claim.uncertaintyNote?.trim()).toBeTruthy();
    }
  });

  it('closes only the three evidenced governance gaps', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.requiredMissingByCategory.governance).toHaveLength(36);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(106);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(64);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(9);
    for (const personId of ['qi-we-wang', 'qin-xiaogong', 'liu-yilong']) {
      expect(report.byPersonId[personId].categories.governance.status).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys).not.toContain('governance');
    }
  });

  it('navigates from each person detail to the related polity', () => {
    for (const [personId, polityId, polityName, year] of [['qi-we-wang', 'qi_warring', '齐', -340], ['qin-xiaogong', 'qin_state', '秦国', -350], ['liu-yilong', 'song_southern', '刘宋', 440]] as const) {
      const onOpenEntity = vi.fn();
      render(<PersonDetail person={people.find((person) => person.id === personId)!} detail={getPersonDetail(personId)!} year={year} claims={claims} people={people} polities={polities} onOpenEntity={onOpenEntity} />);
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`统治 · ${polityName}`) }));
      expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: polityId });
    }
  });
});
