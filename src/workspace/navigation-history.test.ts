import { expect, test } from 'vitest';
import { createNavigationHistory } from './navigation-history';

test('returns semantic states in reverse order and ignores consecutive duplicates', () => {
  const history = createNavigationHistory<string>();
  expect(history.canBack()).toBe(false);
  history.push('all');
  history.push('tongjian');
  history.push('tongjian');
  history.push('tang');
  expect(history.peek()).toBe('tang');
  expect(history.back()).toBe('tang');
  expect(history.back()).toBe('tongjian');
  expect(history.back()).toBe('all');
  expect(history.back()).toBeUndefined();
});

test('keeps only the configured number of entries and can clear them', () => {
  const history = createNavigationHistory<number>(2);
  history.push(1);
  history.push(2);
  history.push(3);
  expect(history.back()).toBe(3);
  expect(history.back()).toBe(2);
  expect(history.back()).toBeUndefined();
  history.push(4);
  history.clear();
  expect(history.canBack()).toBe(false);
});
