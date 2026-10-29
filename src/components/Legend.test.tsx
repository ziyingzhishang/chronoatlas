import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { LocaleProvider } from '../i18n/locale';
import { Legend } from './Legend';

test('explains map expressions in reader language without internal evidence codes', () => {
  render(<LocaleProvider><Legend/></LocaleProvider>);
  expect(screen.getByText('地图表达')).toBeInTheDocument();
  expect(screen.getByText('有来源支持的范围')).toBeInTheDocument();
  expect(screen.getByText('资料不足时留空')).toBeInTheDocument();
  expect(screen.queryByText(/^[ABCD]级/)).not.toBeInTheDocument();
  expect(screen.getByText('控制关系')).toBeInTheDocument();
  expect(screen.getByText('首都／政治中心')).toBeInTheDocument();
});
