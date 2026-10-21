import { boundariesByPolity } from '../data/boundaries';
import { events } from '../data/events';
import { eventsAtYear } from './events';
import { places } from '../data/places';
import { polities } from '../data/polities';
import type { BoundaryState, HistoricalState, SelectedEntity, WorldSlice } from './types';
import { formatHistoricalYear, yearToIndex } from './timeline';

export function getHistoricalState(year: number, options: { maximumFallback?: boolean; world?: WorldSlice } = {}): HistoricalState {
  yearToIndex(year);
  const activePolities = polities.filter(p => p.startYear <= year && year <= p.endYear
    && !(p.id === 'tang' && year >= 690 && year < 705)
    && !(p.id === 'western_qin' && year > 400 && year < 409));
  const boundaries: BoundaryState[] = [];
  for (const polity of activePolities) {
    if (polity.id==='wu_zhou' && year===705 || polity.id==='later_jin' && year===1636) continue;
    const records = boundariesByPolity.get(polity.id) ?? [];
    const intervals = records.filter(b => b.temporalKind === 'interval' && b.validFrom <= year && year <= b.validTo);
    if (intervals.length) { boundaries.push(...intervals.map(b => ({ ...b, presentation: b.presentation ?? 'interval' as const }))); continue; }
    const exact = records.filter(b => !b.temporalKind && b.snapshotYear === year);
    if (exact.length) { boundaries.push(...exact.map(b => ({ ...b, presentation: 'snapshot' as const }))); continue; }
    // Coverage gaps are represented only by explicit curated decisions; no runtime polygon fallback.
  }
  const covered = new Set(boundaries.map(b => b.polityId));
  const missingPolityIds = activePolities.filter(p => !covered.has(p.id)).map(p => p.id);
  const maximumCount = boundaries.filter(b => b.presentation === 'maximum').length;
  const intervalCount = boundaries.filter(b => b.presentation === 'interval').length;
  const mode = !boundaries.length ? 'missing' : maximumCount ? maximumCount === boundaries.length ? 'maximum' : 'mixed' : intervalCount ? 'interval' : 'snapshot';
  // World records are queried at the same selected year, never held beyond their source interval.
  if (options.world && options.world.start <= year && year <= options.world.end) {
    const worldBoundaries = options.world.boundaries.filter(b => b.validFrom <= year && year <= b.validTo);
    const ids = new Set(worldBoundaries.map(b => b.polityId));
    activePolities.push(...options.world.polities.filter(p => ids.has(p.id)));
    boundaries.push(...worldBoundaries.map(b => ({ ...b, presentation:'interval' as const })));
  }
  // Legacy place labels only cover the original reading period, not prehistory or modern times.
  const activePlaces = places.filter(p => (p.validFrom ?? -403) <= year && year <= (p.validTo ?? 959));
  return {
    year, displayLabel: formatHistoricalYear(year), activePolities, boundaries, places: activePlaces,
    events: eventsAtYear(events, year),
    coverage: { mode, snapshotYear: mode === 'snapshot' ? year : undefined, missingPolityIds, maximumCount, intervalCount },
  };
}

export function getEntityById(type: Exclude<SelectedEntity, undefined>['type'], id: string) {
  if (type === 'polity') return polities.find(item => item.id === id);
  if (type === 'place') return places.find(item => item.id === id);
  return events.find(item => item.id === id);
}
