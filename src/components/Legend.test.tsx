import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { LocaleProvider } from '../i18n/locale';
import { Legend } from './Legend';

test('explains all four evidence levels separately from control relationships', () => {
  render(<LocaleProvider><Legend/></LocaleProvider>);
  expect(screen.getByText('疆域证据')).toBeInTheDocument();
  expect(screen.getByText('A级 · 直接来源')).toBeInTheDocument();
  expect(screen.getByText('B级 · 数字化参考')).toBeInTheDocument();
  expect(screen.getByText('C级 · 过渡／最大参考')).toBeInTheDocument();
  expect(screen.getByText('D级 · 文化核心／影响范围')).toBeInTheDocument();
  expect(screen.getByText('控制关系')).toBeInTheDocument();
});
