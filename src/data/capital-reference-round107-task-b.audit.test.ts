import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { getEventDetail } from './event-details';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { getPolityDetail } from './polity-details';
import { polities } from './polities';

const targetPolityIds = new Set(['sui', 'tang']);
const overlap = (from: number | undefined, to: number | undefined, year: number | undefined) => (
  year !== undefined && (from === undefined || from <= year) && (to === undefined || year <= to)
);

const collectCandidates = () => {
  const rows: Array<{ polityId: string; placeId: string; eventId?: string; heritageId?: string }> = [];
  for (const capital of capitalHistory) {
    if (!targetPolityIds.has(capital.polityId)) continue;
    const polity = polities.find((item) => item.id === capital.polityId);
    const detail = getPolityDetail(capital.polityId);
    if (!polity || !detail) continue;

    for (const event of events) {
      const eventDetail = getEventDetail(event.id);
      if (event.placeId !== capital.placeId || !overlap(capital.validFrom, capital.validTo, event.year)) continue;
      if (!eventDetail?.polityIds.includes(capital.polityId) || detail.eventIds.includes(event.id)) continue;
      rows.push({ polityId: capital.polityId, placeId: capital.placeId, eventId: event.id });
    }

    for (const asset of heritageAssets) {
      const heritageDetail = getHeritageDetail(asset.id);
      if (asset.placeId !== capital.placeId || !overlap(capital.validFrom, capital.validTo, asset.constructionFrom)) continue;
      if (!heritageDetail?.associatedPolities.includes(capital.polityId) || detail.heritageIds.includes(asset.id)) continue;
      rows.push({ polityId: capital.polityId, placeId: capital.placeId, heritageId: asset.id });
    }
  }
  return rows;
};

describe('round 107 task B Sui-Tang capital reference audit', () => {
  it('closes the Sui Daxing capital-stage event with aligned endpoints', () => {
    const capital = capitalHistory.find((term) => term.polityId === 'sui' && term.placeId === 'changan');
    const event = events.find((item) => item.id === 'daxing-capital');
    const eventDetail = getEventDetail('daxing-capital');
    const detail = getPolityDetail('sui');

    expect(capital).toMatchObject({ polityId: 'sui', placeId: 'changan', validFrom: 581, validTo: 604 });
    expect(event).toMatchObject({ id: 'daxing-capital', year: 583, placeId: 'changan' });
    expect(eventDetail?.polityIds).toContain('sui');
    expect(eventDetail?.locationIds).toContain('changan');
    expect(event?.year).toBeGreaterThanOrEqual(capital?.validFrom ?? Number.POSITIVE_INFINITY);
    expect(event?.year).toBeLessThanOrEqual(capital?.validTo ?? Number.NEGATIVE_INFINITY);
    expect(detail?.eventIds).toContain('daxing-capital');
  });

  it('keeps every other still-open Sui-Tang candidate visible for boundary review', () => {
    const rows = collectCandidates();
    const keys = rows.map((row) => `${row.polityId}:${row.placeId}:${row.eventId ?? row.heritageId}`);

    expect(keys).toEqual([
      'sui:changan:taiji-palace-site',
      'sui:changan:hanguang-gate-site',
      'sui:changan:mingde-gate-site',
      'sui:luoyang:dingding-gate-site',
      'tang:changan:big-wild-goose-pagoda',
      'tang:changan:qianling',
      'tang:changan:ximing-temple-site',
      'tang:changan:huaqing-palace',
      'tang:luoyang:court-moves-luoyang',
      'tang:luoyang:shangyang-palace-site',
    ]);
    expect(keys).not.toContain('sui:changan:daxing-capital');
  });
});
