import { eventsAtYear } from './events';
import type { BoundaryState, CapitalTerm, HistoricalEvent, HistoricalState, Place, Polity, SelectedEntity, WorldSlice } from './types';
import { formatHistoricalYear, yearToIndex } from './timeline';

export interface ModernSovereigntyReference {
  id: string;
  effectiveFrom: number;
  featureCollection: GeoJSON.FeatureCollection;
}

export interface HistoricalStateSource {
  polities: readonly Polity[];
  boundaries: readonly BoundaryState[];
  events: readonly HistoricalEvent[];
  places: readonly Place[];
  capitalTerms: readonly CapitalTerm[];
  modernSovereignty: readonly ModernSovereigntyReference[];
}

let testDefaultSource: HistoricalStateSource | undefined;

/** Test compatibility only. Production callers must pass the active snapshot source. */
export function setDefaultHistoricalStateSourceForTests(source: HistoricalStateSource) {
  testDefaultSource = source;
}

export function getHistoricalState(source: HistoricalStateSource, year: number, options?: { maximumFallback?: boolean; world?: WorldSlice }): HistoricalState;
export function getHistoricalState(year: number, options?: { maximumFallback?: boolean; world?: WorldSlice }): HistoricalState;
export function getHistoricalState(
  sourceOrYear: HistoricalStateSource | number,
  yearOrOptions: number | { maximumFallback?: boolean; world?: WorldSlice } = {},
  maybeOptions: { maximumFallback?: boolean; world?: WorldSlice } = {},
): HistoricalState {
  const source = typeof sourceOrYear === 'number' ? testDefaultSource : sourceOrYear;
  const year = typeof sourceOrYear === 'number' ? sourceOrYear : yearOrOptions as number;
  const options = (typeof sourceOrYear === 'number' ? yearOrOptions : maybeOptions) as { maximumFallback?: boolean; world?: WorldSlice };
  if (!source) throw new Error('Historical state requires an explicit active release source');
  yearToIndex(year);

  const activePolities = source.polities.filter(p => p.startYear <= year && year <= p.endYear
    && !(p.id === 'tang' && year >= 690 && year < 705)
    && !(p.id === 'western_qin' && year > 400 && year < 409));
  const boundaries: BoundaryState[] = [];
  const boundariesByPolity = new Map<string, BoundaryState[]>();
  for (const boundary of source.boundaries) {
    const records = boundariesByPolity.get(boundary.polityId) ?? [];
    records.push(boundary);
    boundariesByPolity.set(boundary.polityId, records);
  }
  for (const polity of activePolities) {
    if (polity.id === 'wu_zhou' && year === 705 || polity.id === 'later_jin' && year === 1636) continue;
    const records = boundariesByPolity.get(polity.id) ?? [];
    const intervals = records.filter(b => b.temporalKind === 'interval' && b.validFrom <= year && year <= b.validTo);
    if (intervals.length) { boundaries.push(...intervals.map(b => ({ ...b, presentation: b.presentation ?? 'interval' as const }))); continue; }
    const exact = records.filter(b => !b.temporalKind && b.snapshotYear === year);
    if (exact.length) boundaries.push(...exact.map(b => ({ ...b, presentation: 'snapshot' as const })));
  }
  const covered = new Set(boundaries.map(b => b.polityId));
  const missingPolityIds = activePolities.filter(p => !covered.has(p.id)).map(p => p.id);
  const maximumCount = boundaries.filter(b => b.presentation === 'maximum').length;
  const intervalCount = boundaries.filter(b => b.presentation === 'interval').length;
  const mode = !boundaries.length ? 'missing' : maximumCount ? maximumCount === boundaries.length ? 'maximum' : 'mixed' : intervalCount ? 'interval' : 'snapshot';
  if (options.world && options.world.start <= year && year <= options.world.end) {
    const worldBoundaries = options.world.boundaries.filter(b => b.validFrom <= year && year <= b.validTo);
    const ids = new Set(worldBoundaries.map(b => b.polityId));
    activePolities.push(...options.world.polities.filter(p => ids.has(p.id)));
    boundaries.push(...worldBoundaries.map(b => ({ ...b, presentation: 'interval' as const })));
  }
  const capitalTerms = source.capitalTerms.filter(record => record.validFrom <= year && year <= record.validTo);
  const capitalPlaceIds = new Set(capitalTerms.map(record => record.placeId));
  const activePlaces = source.places.filter(p => capitalPlaceIds.has(p.id) || ((p.validFrom ?? -403) <= year && year <= (p.validTo ?? 959)));
  const modernSovereignty = source.modernSovereignty
    .filter(reference => year >= reference.effectiveFrom)
    .flatMap(reference => reference.featureCollection.features);
  return {
    year,
    displayLabel: formatHistoricalYear(year),
    activePolities,
    boundaries,
    places: activePlaces,
    events: eventsAtYear([...source.events], year),
    capitalTerms,
    modernSovereignty: { type: 'FeatureCollection', features: modernSovereignty },
    coverage: { mode, snapshotYear: mode === 'snapshot' ? year : undefined, missingPolityIds, maximumCount, intervalCount },
  };
}

export function getEntityById(source: HistoricalStateSource, type: Exclude<SelectedEntity, undefined>['type'], id: string) {
  if (type === 'polity') return source.polities.find(item => item.id === id);
  if (type === 'place') return source.places.find(item => item.id === id);
  return source.events.find(item => item.id === id);
}
