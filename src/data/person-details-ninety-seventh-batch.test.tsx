import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PersonDetail } from '../components/PersonDetail';
import { events } from './events';
import { people } from './people';
import { personDetails, getPersonDetail } from './person-details';
import { polities } from './polities';
import { sourceNotes } from './sources';

const selectedPeople = ['zhu-yousong', 'shi-kefa'] as const;

describe('ninety-seventh batch person detail audit', () => {
  it('closes the two source-backed key-event gaps without inventing a new event', () => {
    const event = events.find((item) => item.id === 'southern-ming-founded');
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    expect(event).toBeDefined();
    expect(event?.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
    for (const personId of selectedPeople) {
      const detail = getPersonDetail(personId)!;
      expect(detail.keyEvents).toContain('southern-ming-founded');
      expect(detail.sourceIds.every((sourceId) => sourceIds.has(sourceId)), personId).toBe(true);
      expect(detail.sourceIds).toEqual(expect.arrayContaining(event?.sourceIds ?? []));
      expect(detail.offices).toEqual(expect.arrayContaining([
        expect.objectContaining({ polityId: 'ming_southern', validFrom: 1644, validTo: 1645 }),
      ]));
    }
  });

  it('navigates from both person drawers to the Southern Ming formation event', () => {
    for (const personId of selectedPeople) {
      const onOpenEntity = vi.fn();
      render(
        <PersonDetail
          person={people.find((person) => person.id === personId)!}
          detail={getPersonDetail(personId)!}
          year={1644}
          claims={[]}
          people={people}
          polities={polities}
          events={events}
          onOpenEntity={onOpenEntity}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: '南明政权体系形成' }));
      expect(onOpenEntity).toHaveBeenCalledWith({ type: 'event', id: 'southern-ming-founded' });
      cleanup();
    }
  });

  it('keeps the audited person-detail population aligned with the people catalog', () => {
    expect(personDetails).toHaveLength(283);
    expect(new Set(personDetails.map((detail) => detail.personId)).size).toBe(283);
  });
});
