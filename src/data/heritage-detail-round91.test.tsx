import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { HeritageDetail } from '../components/HeritageDetail';
import { capitalHistory } from './capital-history';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const targets = [
  {
    heritageId: 'xian-city-wall', placeId: 'changan', polityId: 'ming', personId: 'zhu-yuanzhang',
    eventId: 'ming-founded', personName: '朱元璋', polityName: '明', eventName: '明建立',
  },
  {
    heritageId: 'wunvshan-goguryeo-early-capital-site', placeId: 'wunvshan', polityId: 'goguryeo', personId: 'jumong',
    eventId: 'goguryeo-founded', personName: '朱蒙', polityName: '高句丽', eventName: '高句丽政权建立（传统纪年）',
  },
  {
    heritageId: 'chu-shouchun-city-site', placeId: 'shouchun', polityId: 'chu_warring', personId: 'chu-we-wang',
    eventId: 'chu-warring-founded-eighth-batch', personName: '楚威王', polityName: '楚', eventName: '楚政权建立（传统分期）',
  },
] as const;

describe('round ninety-first heritage place closure', () => {
  it.each(targets)('$heritageId is a complete, source-backed place relationship', (target) => {
    const asset = heritageAssets.find((item) => item.id === target.heritageId);
    const detail = getHeritageDetail(target.heritageId);
    const place = places.find((item) => item.id === target.placeId);
    const event = events.find((item) => item.id === target.eventId);
    const eventDetail = eventDetails.find((item) => item.eventId === target.eventId);
    const capital = capitalHistory.find((item) => item.polityId === target.polityId && item.placeId === target.placeId);

    expect(asset?.placeId, target.heritageId).toBe(target.placeId);
    expect(asset?.description, target.heritageId).toBeTruthy();
    expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId]), target.heritageId).toBe(true);
    expect(place?.modernName, target.heritageId).toBeTruthy();
    if (target.placeId !== 'changan') expect(capital, target.heritageId).toBeDefined();
    expect(event, target.heritageId).toBeDefined();
    if (target.placeId === 'wunvshan') expect(eventDetail?.locationIds, target.heritageId).toContain(target.placeId);
    expect(detail?.associatedPolities, target.heritageId).toContain(target.polityId);
    expect(detail?.associatedPeople, target.heritageId).toContain(target.personId);
    expect(detail?.associatedEvents, target.heritageId).toContain(target.eventId);
    expect(detail?.constructionHistory.length, target.heritageId).toBeGreaterThanOrEqual(3);
    expect(detail?.constructionHistory.every((phase) => phase.sourceIds.every((sourceId) => sourceById[sourceId])), target.heritageId).toBe(true);
    expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), target.heritageId).toBe(true);
    expect(detail?.uncertaintyNote, target.heritageId).toBeTruthy();
  });

  it.each(targets)('$heritageId opens person, polity and event drawer targets', (target) => {
    const detail = getHeritageDetail(target.heritageId)!;
    const onNavigate = vi.fn();

    render(<HeritageDetail detail={detail} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: target.personName }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'person', id: target.personId });
    fireEvent.click(screen.getByRole('button', { name: target.polityName }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'polity', id: target.polityId });
    fireEvent.click(screen.getByRole('button', { name: target.eventName }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'event', id: target.eventId });
  });

  it('does not alter the five Xuanzang event-boundary details', () => {
    for (const heritageId of ['big-wild-goose-pagoda', 'qinglong-temple-site', 'xian-beilin', 'xiao-yan-ta', 'ximing-temple-site']) {
      const associatedEvents = getHeritageDetail(heritageId)?.associatedEvents;
      if (heritageId === 'ximing-temple-site') {
        expect(associatedEvents).toEqual(['ximing-temple-built', 'xuanzang-at-ximing-658', 'tang-founded', 'xuanzang-translations']);
      } else {
        expect(associatedEvents).toEqual(['tang-founded', 'xuanzang-translations']);
      }
    }
  });
});
