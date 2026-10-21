import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from './App';
import userEvent from '@testing-library/user-event';

test('keeps secondary controls closed until requested', async () => {
  render(<App />);
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  expect(screen.getByRole('status', { name: '当前历史状态' })).toHaveTextContent('800年');
  expect(screen.queryByRole('button', { name: '图层' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '事件' })).toBeInTheDocument();
  expect(screen.queryByRole('complementary',{name:'历史信息'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'全历史'})).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'展开时间控制器'}));
  expect(screen.getByRole('button', { name: '全历史' })).toBeInTheDocument();
});
