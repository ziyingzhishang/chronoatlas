import { yearToIndex, type YearWindow } from './timeline';
import type { HistoricalEvent } from './types';

interface SnapPeriod {
  start: number;
  end: number;
  intervals?: readonly (readonly [number, number])[];
}

export function timelineSnapCandidates(
  periods: readonly SnapPeriod[],
  boundaries: readonly number[],
  events: readonly Pick<HistoricalEvent, 'year'|'endYear'>[],
): number[] {
  return [...new Set([
    ...periods.flatMap(period => (period.intervals ?? [[period.start, period.end]]).flatMap(([start, end]) => [start, end])),
    ...boundaries,
    ...events.flatMap(event=>event.endYear===undefined?[event.year]:[event.year,event.endYear]),
  ])];
}

export function snapTimelineYear(year: number, candidates: number[], window: YearWindow, trackWidth: number, thresholdPx = 12): number {
  if (trackWidth <= 0) return year;
  const start = yearToIndex(window[0]);
  const span = yearToIndex(window[1]) - start;
  const currentX = ((yearToIndex(year) - start) / span) * trackWidth;
  let nearest = year;
  let nearestDistance = thresholdPx;
  for (const candidate of candidates) {
    if (candidate < window[0] || candidate > window[1]) continue;
    const distance = Math.abs(((yearToIndex(candidate) - start) / span) * trackWidth - currentX);
    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }
  return nearest;
}
