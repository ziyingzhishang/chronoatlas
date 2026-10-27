import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { Timeline } from './Timeline';
import { yearToIndex } from '../domain/timeline';
import { LocaleProvider } from '../i18n/locale';
import { TimeAnalysisPanel } from '../workspace/TimeAnalysisPanel';

afterEach(() => localStorage.clear());

test('English analysis exposes dates, period choices and validation in the selected language', async () => {
  localStorage.setItem('history-locale', 'en');
  render(<LocaleProvider><TimeAnalysisPanel year={-221} onYearChange={vi.fn()} annotationLayer="none" onAnnotationLayerChange={vi.fn()} onClose={vi.fn()}/></LocaleProvider>);
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '221 BCE');
  expect(screen.getByRole('option', {name:/^Qin ·/})).toBeInTheDocument();
  expect(screen.getByRole('button',{name:/^Focus Tang, 705/})).toHaveTextContent('Tang');
  const input = screen.getByRole('spinbutton', {name:'Enter historical year'});
  await userEvent.clear(input);
  await userEvent.type(input, '0{Enter}');
  expect(screen.getByRole('alert')).toHaveTextContent('There is no year 0');
});

test('changes the selected year through the slider and exposes a historical accessible label', () => {
  const onYearChange = vi.fn();
  render(<Timeline year={-221} onYearChange={onYearChange} annotationLayer="none"/>);
  const slider = screen.getByRole('slider');
  expect(slider).toHaveAttribute('aria-valuetext', '前221年');
  fireEvent.change(slider, { target: { value: String(yearToIndex(-220)) } });
  expect(onYearChange).toHaveBeenCalledWith(-220);
});

test('previews rapid slider input and commits the final year',()=>{
  const preview=vi.fn();
  const commit=vi.fn();
  render(<Timeline year={800} onYearChange={preview} onYearCommit={commit} annotationLayer="none"/>);
  const slider=screen.getByRole('slider');
  fireEvent.input(slider,{target:{value:String(yearToIndex(1271))}});
  fireEvent.input(slider,{target:{value:String(yearToIndex(1644))}});
  expect(commit).not.toHaveBeenCalled();
  fireEvent.change(slider,{target:{value:String(yearToIndex(1644))}});
  expect(preview).toHaveBeenLastCalledWith(1644);
  expect(commit).toHaveBeenCalledWith(1644);
});

test('event annotations expose clustered event navigation without mounting the full directory', async () => {
  const selectGroup=vi.fn();
  render(<Timeline year={800} onYearChange={vi.fn()} annotationLayer="events" onEventGroup={selectGroup}/>);
  await userEvent.click(screen.getByRole('button',{name:'查看前65年附近19个事件'}));
  expect(selectGroup).toHaveBeenCalledWith(expect.arrayContaining(['red-cliffs']));
  expect(screen.queryByText('历史转折快捷跳转')).not.toBeInTheDocument();
});

test('focuses the chosen dynasty without changing the current year', async () => {
  const onYearChange = vi.fn();
  const onViewWindowChange = vi.fn();
  render(<TimeAnalysisPanel year={800} onYearChange={onYearChange} annotationLayer="none" onAnnotationLayerChange={vi.fn()} onClose={vi.fn()} onViewWindowChange={onViewWindowChange}/>);
  await userEvent.selectOptions(screen.getByRole('combobox'), 'ming');
  expect(onYearChange).not.toHaveBeenCalled();
  expect(onViewWindowChange).toHaveBeenCalledWith([1368, 1644]);
});

test('exposes a semantic back action after a range drill-down', async () => {
  const onBackView = vi.fn();
  render(<TimeAnalysisPanel year={800} onYearChange={vi.fn()} annotationLayer="none" onAnnotationLayerChange={vi.fn()} onClose={vi.fn()} viewLabel="《资治通鉴》" canGoBack onBackView={onBackView}/>);
  await userEvent.click(screen.getByRole('button', { name: '返回上一级' }));
  expect(onBackView).toHaveBeenCalledOnce();
});

test('selects the Tongjian range without removing access to all history', async () => {
  render(<TimeAnalysisPanel year={800} onYearChange={vi.fn()} annotationLayer="none" onAnnotationLayerChange={vi.fn()} onClose={vi.fn()}/>);
  await userEvent.click(screen.getByRole('button', { name: '聚焦资治通鉴 前403年至959年' }));
  expect(screen.getByRole('slider')).toHaveAttribute('min', String(yearToIndex(-403)));
  expect(screen.getByRole('slider')).toHaveAttribute('max', String(yearToIndex(959)));
  await userEvent.click(screen.getByRole('button', { name: '全历史' }));
  expect(screen.getByRole('slider')).toHaveAttribute('min', String(yearToIndex(-8000)));
  expect(screen.getByRole('slider')).toHaveAttribute('max', String(yearToIndex(2026)));
});

test('validates a complete input instead of jumping as each digit is typed', async () => {
  const onYearChange = vi.fn();
  render(<Timeline year={800} onYearChange={onYearChange} annotationLayer="none"/>);
  const input = screen.getByRole('spinbutton', { name: '输入历史年份' });
  await userEvent.clear(input);
  await userEvent.type(input, '1500');
  expect(onYearChange).not.toHaveBeenCalled();
  await userEvent.keyboard('{Enter}');
  expect(onYearChange).toHaveBeenLastCalledWith(1500);
  await userEvent.clear(input);
  await userEvent.type(input, '0{Enter}');
  expect(screen.getByRole('alert')).toHaveTextContent('没有公元0年');
});

test('submitting the selected year recenters a viewport that was panned away', async () => {
  render(<Timeline year={800} onYearChange={vi.fn()} annotationLayer="none"/>);
  await userEvent.click(screen.getByRole('button', { name: '逐年' }));
  await userEvent.click(screen.getByRole('button', { name: '时间轴向后平移' }));
  expect(Number(screen.getByRole('slider').getAttribute('min'))).toBeGreaterThan(yearToIndex(800));
  await userEvent.click(screen.getByRole('button', { name: '前往' }));
  expect(Number(screen.getByRole('slider').getAttribute('min'))).toBeLessThanOrEqual(yearToIndex(800));
  expect(Number(screen.getByRole('slider').getAttribute('max'))).toBeGreaterThanOrEqual(yearToIndex(800));
});

test('change annotations can move directly to a published source change', async () => {
  const change=vi.fn();
  render(<Timeline year={-213} onYearChange={change} annotationLayer="changes"/>);
  await userEvent.click(screen.getByRole('button',{name:'查看前212年疆域断面'}));
  expect(change).toHaveBeenCalledWith(-212);
});
