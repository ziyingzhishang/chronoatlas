import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { HeritageDetail } from '../components/HeritageDetail';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { polities } from './polities';
import { sourceById } from './sources';

const cases = [
  {
    heritageId: 'goguryeo-guonei-city-site',
    placeId: 'guonei',
    polityId: 'goguryeo',
    personId: 'jumong',
    eventId: 'goguryeo-founded',
    polityName: '高句丽',
    personName: '朱蒙',
    eventName: '高句丽政权建立（传统纪年）',
  },
  {
    heritageId: 'later-qin-changan-city-layer',
    placeId: 'changan',
    polityId: 'later_qin',
    personId: 'yao-xing',
    eventId: 'later-qin-founded',
    polityName: '后秦',
    personName: '姚兴',
    eventName: '后秦政权形成',
  },
] as const;

describe('round ninety-seventh heritage claims and navigation closure', () => {
  it.each(cases)('$heritageId keeps all existing entity endpoints resolvable', (item) => {
    const asset = heritageAssets.find((candidate) => candidate.id === item.heritageId);
    const detail = getHeritageDetail(item.heritageId);

    expect(asset?.placeId, item.heritageId).toBe(item.placeId);
    expect(detail?.associatedPeople, item.heritageId).toContain(item.personId);
    expect(detail?.associatedPolities, item.heritageId).toContain(item.polityId);
    expect(detail?.associatedEvents, item.heritageId).toContain(item.eventId);
    expect(people.some((person) => person.id === item.personId), item.heritageId).toBe(true);
    expect(polities.some((polity) => polity.id === item.polityId), item.heritageId).toBe(true);
    expect(events.some((event) => event.id === item.eventId), item.heritageId).toBe(true);
    expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), item.heritageId).toBe(true);
  });

  it.each(cases)('$heritageId opens person, polity and event drawers', (item) => {
    const detail = getHeritageDetail(item.heritageId)!;
    const onNavigate = vi.fn();

    render(<HeritageDetail detail={detail} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: item.personName }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'person', id: item.personId });
    fireEvent.click(screen.getByRole('button', { name: item.polityName }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'polity', id: item.polityId });
    fireEvent.click(screen.getByRole('button', { name: item.eventName }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'event', id: item.eventId });
  });
});
