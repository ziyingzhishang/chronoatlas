import { expect, test } from 'vitest';
import { periodAtYear } from './periods';

test('the timeline does not call the Tang and Wu Zhou concurrent during the interruption', () => {
  expect(periodAtYear(700).map(p => p.name)).toEqual(['武周']);
  expect(periodAtYear(689).map(p => p.name)).toContain('唐');
  expect(periodAtYear(706).map(p => p.name)).toContain('唐');
});
