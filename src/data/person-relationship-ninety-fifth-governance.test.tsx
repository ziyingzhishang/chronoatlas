import { fireEvent, render } from '@testing-library/react';
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
  { id: 'claim-shi-jingtang-ruled-later-jin-ninetyfifth', subjectId: 'shi-jingtang', objectId: 'jin_later', validFrom: 936, validTo: 942 },
  { id: 'claim-guo-wei-ruled-later-zhou-ninetyfifth', subjectId: 'guo-wei', objectId: 'zhou_later', validFrom: 951, validTo: 954 },
  { id: 'claim-meng-zhixiang-ruled-later-shu-ninetyfifth', subjectId: 'meng-zhixiang', objectId: 'later_shu', validFrom: 934, validTo: 934 },
] as const;

describe('ninety-fifth batch high-confidence governance relationships', () => {
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
      expect(claim.evidenceType, claim.id).toBe('explicit-record');
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

  it('closes only the three evidenced governance gaps without changing other categories', () => {
    const report = buildPersonRelationshipCoverageReport();

    for (const personId of ['shi-jingtang', 'guo-wei', 'meng-zhixiang']) {
      expect(report.byPersonId[personId].categories.governance.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('governance');
    }
    expect(report.byPersonId['shi-jingtang'].categories.kinship.status).toBe('missing');
    expect(report.byPersonId['guo-wei'].categories.allianceConflict.status).toBe('covered');
    expect(report.byPersonId['meng-zhixiang'].categories.eventParticipation.status).toBe('covered');
  });

  it('navigates from each person detail to the related polity', () => {
    for (const [personId, polityId, polityName, year] of [
      ['shi-jingtang', 'jin_later', '后晋', 936],
      ['guo-wei', 'zhou_later', '后周', 951],
      ['meng-zhixiang', 'later_shu', '后蜀', 934],
    ] as const) {
      const onOpenEntity = vi.fn();
      const { getByRole } = render(
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

      fireEvent.click(getByRole('button', { name: new RegExp(`统治 · ${polityName}`) }));
      expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: polityId });
    }
  });
});
