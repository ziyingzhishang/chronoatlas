import { expect, test } from 'vitest';
import { snapTimelineYear, timelineSnapCandidates } from './timeline-snap';

test('snaps to the nearest historical marker within the visual threshold', () => {
  expect(snapTimelineYear(622, [618, 700], [-100, 1000], 600)).toBe(618);
});

test('leaves ordinary years exact when no marker is close', () => {
  expect(snapTimelineYear(650, [618, 705], [-100, 1000], 600)).toBe(650);
});

test('does not snap to markers outside the visible window', () => {
  expect(snapTimelineYear(650, [618, 705, 1200], [-100, 1000], 600)).toBe(650);
});

test('shared candidates include period boundaries and event start and end years', () => {
  const candidates=timelineSnapCandidates([{year:42,endYear:45} as never]);
  expect(candidates).toContain(618);
  expect(candidates).toContain(42);
  expect(candidates).toContain(45);
});
