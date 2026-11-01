import { expect, test } from 'vitest';
import { sliderThumbCenter, alignedSourceScroll } from './timeline-alignment';
import { yearToIndex } from '../domain/timeline';

test.each([[0,112],[5,210],[10,308]])('thumb center includes padding and thumb travel at %s', (value,expected) => {
  expect(sliderThumbCenter(value,0,10,100,220,2,2,20)).toBe(expected);
});
test('thumb travel clamps outside the window and crosses directly from BCE to CE', () => {
  expect(sliderThumbCenter(yearToIndex(-1),yearToIndex(-1),yearToIndex(1),0,220,2,2,20)).toBe(12);
  expect(sliderThumbCenter(yearToIndex(1),yearToIndex(-1),yearToIndex(1),0,220,2,2,20)).toBe(208);
  expect(sliderThumbCenter(-5,0,10,0,220,2,2,20)).toBe(12);
});
test('source alignment moves only horizontal scroll and clamps at both limits', () => {
  expect(alignedSourceScroll(400,510,310,1200)).toBe(600);
  expect(alignedSourceScroll(20,50,310,1200)).toBe(0);
  expect(alignedSourceScroll(1150,510,310,1200)).toBe(1200);
});
