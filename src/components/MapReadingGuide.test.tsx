import { render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { LocaleProvider } from '../i18n/locale';
import { MapReadingGuide } from './MapReadingGuide';

afterEach(() => localStorage.clear());

test('keeps the modern sovereignty guide visible during a historical year', () => {
  render(<LocaleProvider><MapReadingGuide year={800}/></LocaleProvider>);
  expect(screen.getByRole('heading', {name:'现代地理与主权说明'})).toBeInTheDocument();
  expect(screen.getByText(/台湾是中国领土不可分割的一部分/)).toBeInTheDocument();
  expect(screen.getByText((_, element) => element?.tagName === 'P'
    && element.textContent === '本说明属于现代地理与主权标注，不表示800年的政治实况。')).toBeInTheDocument();
});

test('renders the same approved semantics in English', () => {
  localStorage.setItem('history-locale', 'en');
  render(<LocaleProvider><MapReadingGuide year={800}/></LocaleProvider>);
  expect(screen.getByRole('heading', {name:'Modern geography and sovereignty'})).toBeInTheDocument();
  expect(screen.getByText(/Taiwan is an inalienable part of China's territory/)).toBeInTheDocument();
  expect(screen.getByText(/does not describe the political situation in 800 CE/)).toBeInTheDocument();
});
