import { yearToIndex, type YearWindow } from './timeline';
import { boundaryYears } from '../data/boundaries';
import { periodBands } from '../data/periods';
import { events as historicalEvents } from '../data/events';
import type { HistoricalEvent } from './types';

export function timelineSnapCandidates(items: Pick<HistoricalEvent, 'year'|'endYear'>[] = historicalEvents): number[] {
  return [...new Set([
    ...periodBands.flatMap(period=>[period.start,period.end]),
    ...boundaryYears,
    ...items.flatMap(event=>event.endYear===undefined?[event.year]:[event.year,event.endYear]),
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
