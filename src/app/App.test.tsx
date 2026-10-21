import { render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from './App';
import userEvent from '@testing-library/user-event';

test('keeps secondary controls closed until requested', async () => {
  render(<App />);
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '当前历史状态' })).toHaveTextContent('800年');
  expect(screen.queryByRole('button', { name: '图层' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '事件' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '详情' })).not.toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: '工作台工具' })).toHaveClass('workspace-tool-nav');
  expect(screen.getByRole('searchbox', { name: '搜索历史事件' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  expect(screen.getByRole('complementary', { name: '政权目录' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  expect(screen.queryByRole('complementary', { name: '政权目录' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  expect(screen.getByRole('complementary', { name: '政权目录' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('searchbox', { name: '搜索历史事件' }));
  expect(screen.queryByRole('complementary', { name: '政权目录' })).not.toBeInTheDocument();
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

test('opens a deep entity drawer from the polity study view and supports back navigation', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  await userEvent.click(screen.getByRole('button', { name: /唐/ }));
  await userEvent.click(screen.getByRole('button', { name: /李世民/ }));
  expect(screen.getByRole('dialog', { name: '李世民' })).toHaveClass('entity-drawer');
  expect(screen.getByText('人物关系')).toBeInTheDocument();
  await userEvent.click(within(screen.getByRole('dialog', { name: '李世民' })).getByRole('button', { name: '关闭详情' }));
  expect(screen.queryByRole('dialog', { name: '李世民' })).not.toBeInTheDocument();
});

test('opens polity detail from the compact card in the existing entity drawer', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '当前历史状态' }));
  await userEvent.click(screen.getByRole('button', { name: /唐/ }));
  await userEvent.click(screen.getByRole('button', { name: '展开政权详情' }));

  const drawer = screen.getByRole('dialog', { name: '唐' });
  expect(drawer).toHaveClass('entity-drawer');
  expect(within(drawer).getByRole('heading', { name: '建立过程' })).toBeInTheDocument();
  expect(screen.getAllByRole('dialog', { name: '唐' })).toHaveLength(1);
  expect(within(drawer).queryByRole('button', { name: '展开政权详情' })).not.toBeInTheDocument();
});
