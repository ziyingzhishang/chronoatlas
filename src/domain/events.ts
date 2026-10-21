import type { HistoricalEvent } from './types';

function includesYear(event: HistoricalEvent, year: number): boolean {
  return year !== 0 && year >= event.year && year <= (event.endYear ?? event.year);
}

export function eventsAtYear(items: HistoricalEvent[], year: number): HistoricalEvent[] {
  return items.filter(event => includesYear(event, year));
}

export function queryEvents(
  items: HistoricalEvent[],
  filters: { query?: string; region?: string; category?: string },
): HistoricalEvent[] {
  const query = filters.query?.trim().toLowerCase() ?? '';
  return items.filter(event => {
    if (filters.region && event.region !== filters.region) return false;
    if (filters.category && event.category !== filters.category) return false;
    if (!query) return true;
    const text = [event.title, event.summary, event.category, event.background,
      event.process, event.impact, event.mapNote].filter(Boolean).join('\n').toLowerCase();
    return text.includes(query);
  });
}

export function eventYear(event: HistoricalEvent, currentYear: number): number {
  return includesYear(event, currentYear) ? currentYear : event.year;
}
