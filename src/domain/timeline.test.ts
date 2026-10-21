import { expect, test } from 'vitest';
import {
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  formatHistoricalYear,
  getTimelineYears,
  indexToYear,
  yearToIndex,
} from './timeline';

test('exposes every year except year zero', () => {
  const years = getTimelineYears();
  expect(years[0]).toBe(TIMELINE_MIN_YEAR);
  expect(years.at(-1)).toBe(TIMELINE_MAX_YEAR);
  expect(years).not.toContain(0);
  expect(years).toContain(-8000);
  expect(years).toContain(2026);
});

test('round trips the year around the BCE/CE boundary', () => {
  expect(indexToYear(yearToIndex(-1))).toBe(-1);
  expect(indexToYear(yearToIndex(1))).toBe(1);
  expect(indexToYear(yearToIndex(-1) + 1)).toBe(1);
});

test('formats historical years without a year zero', () => {
  expect(formatHistoricalYear(-403)).toBe('前403年');
  expect(formatHistoricalYear(-1)).toBe('前1年');
  expect(formatHistoricalYear(1)).toBe('公元1年');
  expect(formatHistoricalYear(959)).toBe('959年');
});

test('rejects zero and out-of-range years', () => {
  expect(() => yearToIndex(0)).toThrow(RangeError);
  expect(() => yearToIndex(TIMELINE_MIN_YEAR - 1)).toThrow(RangeError);
  expect(() => indexToYear(-1)).toThrow(RangeError);
});
