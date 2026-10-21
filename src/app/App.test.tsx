import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from './App';
import userEvent from '@testing-library/user-event';

test('keeps secondary controls closed until requested', async () => {
  render(<App />);
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  expect(screen.getByRole('status', { name: '当前历史状态' })).toHaveTextContent('800年');
  expect(screen.queryByRole('button', { name: '图层' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '事件' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '详情' })).not.toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: '工作台工具' })).toHaveClass('workspace-tool-nav');
  expect(screen.getByRole('searchbox', { name: '搜索历史事件' })).toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: '事件地域' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('searchbox', { name: '搜索历史事件' }));
  expect(screen.getByRole('combobox', { name: '事件地域' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: /安史之乱/ })).toBeInTheDocument();
  await userEvent.type(screen.getByRole('searchbox', { name: '搜索历史事件' }), '秦统一');
  expect(screen.getByRole('option', { name: /秦统一六国/ })).toBeInTheDocument();
  expect(screen.queryByRole('status', { name: '疆域资料状态' })).not.toBeInTheDocument();
  expect(screen.queryByRole('complementary',{name:'历史信息'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'全历史'})).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'展开时间控制器'}));
  expect(screen.getByRole('button', { name: '全历史' })).toBeInTheDocument();
});

test('opens the more information as a bottom-right HUD', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '更多' }));
  expect(screen.getByRole('dialog', { name: '阅读说明与来源' })).toHaveClass('workspace-hud');
});
