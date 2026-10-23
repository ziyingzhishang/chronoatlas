import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { validateClaims } from '../domain/claims';
import { PersonDetail } from '../components/PersonDetail';
import { claims } from './claims';
import { getPersonDetail } from './person-details';
import { people } from './people';
import { polities } from './polities';
import { buildPersonRelationshipCoverageReport } from './person-relationship-coverage';
import { sourceNotes } from './sources';

const expectedRelations = {
  'claim-han-kangzi-grandparent-han-qian-ninetyfourth': ['han-kangzi', 'grandparent-of', 'han-qian', -453, -403],
  'claim-han-qian-grandchild-han-kangzi-ninetyfourth': ['han-qian', 'grandchild-of', 'han-kangzi', -403, -400],
  'claim-li-bian-grandparent-li-yu-ninetyfourth': ['li-bian', 'grandparent-of', 'li-yu', 937, 943],
  'claim-li-yu-grandchild-li-bian-ninetyfourth': ['li-yu', 'grandchild-of', 'li-bian', 937, 978],
} as const;

describe('ninety-fourth batch high-confidence kinship relationships', () => {
  afterEach(() => cleanup());

  it('records only direct, source-backed royal and family-lineage edges', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    for (const [claimId, [subjectId, predicate, objectId, validFrom, validTo]] of Object.entries(expectedRelations)) {
      const claim = claims.find((item) => item.id === claimId);
      expect(claim, claimId).toMatchObject({
        subjectId, predicate, objectId, validFrom, validTo,
        datePrecision: 'range', perspective: 'person', evidenceType: 'explicit-record', confidence: 'high',
      });
      expect(peopleIds.has(subjectId), claimId).toBe(true);
      expect(peopleIds.has(objectId), claimId).toBe(true);
      expect(claim?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), claimId).toBe(true);
      expect(claim?.uncertaintyNote?.trim(), claimId).toBeTruthy();
      expect(validateClaims([claim!], new Set(peopleIds))).toEqual([]);
    }
  });

  it('keeps both endpoint details and time evidence available', () => {
    for (const personId of ['han-kangzi', 'han-qian', 'li-bian', 'li-yu']) {
      const person = people.find((item) => item.id === personId)!;
      const detail = getPersonDetail(personId);
      expect(detail, personId).toBeDefined();
      expect(detail?.biography, personId).toBeTruthy();
      expect(detail?.offices.length, personId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, personId).toBeGreaterThan(0);
      expect(person.birthYear !== undefined || person.deathYear !== undefined || detail?.offices.some((office) => office.validFrom !== undefined), personId).toBe(true);
    }
  });

  it('reduces only the four directly evidenced kinship gaps', () => {
    const report = buildPersonRelationshipCoverageReport();
    expect(report.requiredMissingByCategory.governance).toHaveLength(22);
    expect(report.requiredMissingByCategory.kinship).toHaveLength(110);
    expect(report.requiredMissingByCategory.allianceConflict).toHaveLength(69);
    expect(report.requiredMissingByCategory.eventParticipation).toHaveLength(10);
    for (const personId of ['han-kangzi', 'han-qian', 'li-bian', 'li-yu']) {
      expect(report.byPersonId[personId].categories.kinship.status, personId).toBe('covered');
      expect(report.byPersonId[personId].requiredMissingCategoryKeys, personId).not.toContain('kinship');
    }
  });

  it('navigates each relationship from the person detail drawer', () => {
    for (const [personId, year, label, direction, targetId] of [
      ['han-kangzi', -403, '祖父母／外祖父母 · 韩虔', '韩康子 → 韩虔', 'han-qian'],
      ['han-qian', -403, '孙辈／外孙辈 · 韩康子', '韩虔 → 韩康子', 'han-kangzi'],
      ['li-bian', 940, '祖父母／外祖父母 · 李煜', '李昪 → 李煜', 'li-yu'],
      ['li-yu', 940, '孙辈／外孙辈 · 李昪', '李煜 → 李昪', 'li-bian'],
    ] as const) {
      const onOpenEntity = (entity: { type: 'person' | 'polity' | 'event' | 'heritage'; id: string }) => {
        expect(entity).toEqual({ type: 'person', id: targetId });
      };
      render(
        <PersonDetail
          person={people.find((item) => item.id === personId)!}
          detail={getPersonDetail(personId)!}
          year={year}
          claims={claims}
          people={people}
          polities={polities}
          onOpenEntity={onOpenEntity}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`${label}.*方向：${direction}`) }));
      cleanup();
    }
  });
});
