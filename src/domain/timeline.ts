export const TIMELINE_MIN_YEAR = -8000;
export const TIMELINE_MAX_YEAR = 2026;
export const TONGJIAN_RANGE: [number, number] = [-403, 959];
export type YearWindow = [number, number];

const timelineYears = Object.freeze([
  ...Array.from({ length: Math.abs(TIMELINE_MIN_YEAR) }, (_, index) => TIMELINE_MIN_YEAR + index),
  ...Array.from({ length: TIMELINE_MAX_YEAR }, (_, index) => index + 1),
]);

function assertYear(year: number): void {
  if (!Number.isInteger(year) || year === 0 || year < TIMELINE_MIN_YEAR || year > TIMELINE_MAX_YEAR) {
    throw new RangeError(`历史年份必须在前8000年至2026年之间且不能为公元0年：${year}`);
  }
}

export function getTimelineYears(): number[] {
  return [...timelineYears];
}

export function yearToIndex(year: number): number {
  assertYear(year);
  return year - TIMELINE_MIN_YEAR - (year > 0 ? 1 : 0);
}

export function fitWindow(centerIndex: number, requestedSpan: number): YearWindow {
  const max = timelineYears.length - 1;
  const span = Math.min(max, Math.max(2, Math.round(requestedSpan)));
  const start = Math.max(0, Math.min(max - span, Math.round(centerIndex - span / 2)));
  return [indexToYear(start), indexToYear(start + span)];
}

export function yearPosition(year: number, window: YearWindow): number {
  return (yearToIndex(year) - yearToIndex(window[0])) / (yearToIndex(window[1]) - yearToIndex(window[0])) * 100;
}

export function makeTicks(window: YearWindow, targetCount = 8) {
  const span = yearToIndex(window[1]) - yearToIndex(window[0]);
  const step = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000].find(s => span / s <= targetCount) ?? 2000;
  const minorStep = Math.max(1, step / (step % 5 === 0 ? 5 : 2));
  const ticks: { year: number; position: number; major: boolean }[] = [];
  for (let y = Math.ceil(window[0] / minorStep) * minorStep; y <= window[1]; y += minorStep) {
    if (y === 0 || !Number.isInteger(y)) continue;
    ticks.push({ year: y, position: yearPosition(y, window), major: y % step === 0 });
  }
  if (window[0] < 0 && window[1] > 0 && !ticks.some(t => t.year === 1)) {
    ticks.push({ year: 1, position: yearPosition(1, window), major: true });
  }
  return ticks.sort((a, b) => a.year - b.year);
}

export function indexToYear(index: number): number {
  if (!Number.isInteger(index) || index < 0 || index >= timelineYears.length) {
    throw new RangeError(`时间轴索引超出范围：${index}`);
  }
  return timelineYears[index];
}

export function formatHistoricalYear(year: number): string {
  assertYear(year);
  if (year < 0) return `前${Math.abs(year)}年`;
  return year === 1 ? '公元1年' : `${year}年`;
}
