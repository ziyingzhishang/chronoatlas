import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Timeline } from './Timeline';
import { yearToIndex } from '../domain/timeline';
import { LocaleProvider } from '../i18n/locale';
import { playMechanicalTick } from '../domain/mechanical-sound';

vi.mock('../domain/mechanical-sound',()=>({playMechanicalTick:vi.fn()}));

test('English timeline exposes dates, period choices and validation in the selected language', async () => {
  localStorage.setItem('history-locale', 'en');
  render(<LocaleProvider><Timeline year={-221} onYearChange={vi.fn()} isPlaying={false} onPlayToggle={vi.fn()}/></LocaleProvider>);
  localStorage.removeItem('history-locale');
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '221 BCE');
  expect(screen.getByRole('option', {name:/^Qin ·/})).toBeInTheDocument();
  expect(screen.getByRole('button',{name:/^Focus Tang, 705/})).toHaveTextContent('Tang');
  const input = screen.getByRole('spinbutton', {name:'Enter historical year'});
  await userEvent.clear(input);
  await userEvent.type(input, '0{Enter}');
  expect(screen.getByRole('alert')).toHaveTextContent('There is no year 0');
});

test('changes the selected year through the slider and displays a historical label', async () => {
  const onYearChange = vi.fn();
  render(<Timeline year={-221} onYearChange={onYearChange} isPlaying={false} onPlayToggle={vi.fn()} />);

  expect(screen.getByText('前221年')).toBeInTheDocument();
  const slider = screen.getByRole('slider');
  fireEvent.change(slider, { target: { value: String(yearToIndex(-220)) } });
  expect(onYearChange).toHaveBeenCalledWith(-220);
});

test('previews rapid slider input and commits the final year',()=>{
  const preview=vi.fn();
  const commit=vi.fn();
  render(<Timeline year={800} onYearChange={preview} onYearCommit={commit} isPlaying={false} onPlayToggle={vi.fn()}/>);
  const slider=screen.getByRole('slider');
  fireEvent.input(slider,{target:{value:String(yearToIndex(1271))}});
  fireEvent.input(slider,{target:{value:String(yearToIndex(1644))}});
  expect(commit).not.toHaveBeenCalled();
  fireEvent.change(slider,{target:{value:String(yearToIndex(1644))}});
  expect(preview).toHaveBeenLastCalledWith(1644);
  expect(commit).toHaveBeenCalledWith(1644);
});

test('slider magnetic feedback snaps nearby drags onto historical dates', () => {
  const onYearChange=vi.fn();
  render(<Timeline year={800} onYearChange={onYearChange} isPlaying={false} onPlayToggle={vi.fn()}/>);
  const slider=screen.getByRole('slider');
  fireEvent.input(slider,{target:{value:String(yearToIndex(616))}});
  expect(onYearChange).toHaveBeenLastCalledWith(617);
  expect(slider).toHaveAttribute('data-snapped','true');
});

test('source-change nodes start in a single ordered row and can reveal the complete list', async () => {
  render(<Timeline year={800} onYearChange={vi.fn()} isPlaying={false} onPlayToggle={vi.fn()} />);
  const nodes=screen.getByRole('group',{name:'可用疆域断面'});
  expect(nodes).toHaveAttribute('data-expanded','false');
  const years=[...nodes.querySelectorAll<HTMLButtonElement>('button[data-year]')].map(button=>Number(button.dataset.year));
  expect(years).toEqual([...years].sort((a,b)=>a-b));
  await userEvent.click(screen.getByRole('button',{name:'展开资料变化节点'}));
  expect(nodes).toHaveAttribute('data-expanded','true');
  expect(document.getElementById('snapshot-node-track')).toHaveAttribute('data-expanded','true');
  expect(document.getElementById('snapshot-node-track')).toHaveStyle({maxHeight:'min(30dvh, 320px)',overflowY:'auto'});
});

test('source-change snap sound is off by default and remembers an explicit opt-in', async () => {
  localStorage.removeItem('timeline-snap-sound');
  render(<Timeline year={800} onYearChange={vi.fn()} isPlaying={false} onPlayToggle={vi.fn()} />);
  await userEvent.click(screen.getByRole('button',{name:'展开资料变化节点'}));
  const toggle=screen.getByRole('button',{name:'开启吸附提示音'});
  expect(toggle).toHaveAttribute('aria-pressed','false');
  await userEvent.click(toggle);
  expect(localStorage.getItem('timeline-snap-sound')).toBe('true');
  expect(screen.getByRole('button',{name:'关闭吸附提示音'})).toHaveAttribute('aria-pressed','true');
});

test('plays the optional tick only when a drag snaps onto a source-change year',()=>{
  localStorage.setItem('timeline-snap-sound','true');
  vi.mocked(playMechanicalTick).mockClear();
  render(<Timeline year={800} onYearChange={vi.fn()} isPlaying={false} onPlayToggle={vi.fn()}/>);
  const slider=screen.getByRole('slider');
  fireEvent.input(slider,{target:{value:String(yearToIndex(617))}});
  expect(playMechanicalTick).not.toHaveBeenCalled();
  fireEvent.input(slider,{target:{value:String(yearToIndex(616))}});
  expect(playMechanicalTick).toHaveBeenCalledOnce();
});

test('turns off ruler magnification when reduced motion is requested',()=>{
  const original=window.matchMedia;
  Object.defineProperty(window,'matchMedia',{configurable:true,value:()=>({matches:true,media:'(prefers-reduced-motion: reduce)',addEventListener:vi.fn(),removeEventListener:vi.fn()})});
  render(<Timeline year={800} onYearChange={vi.fn()} isPlaying={false} onPlayToggle={vi.fn()}/>);
  fireEvent.input(screen.getByRole('slider'),{target:{value:String(yearToIndex(616))}});
  const ticks=[...document.querySelectorAll<HTMLElement>('.year-tick')];
  expect(ticks.length).toBeGreaterThan(0);
  expect(ticks.every(tick=>tick.style.getPropertyValue('--wave-scale')==='1')).toBe(true);
  Object.defineProperty(window,'matchMedia',{configurable:true,value:original});
});

test('offers a key-node button for Qin unification', async () => {
  const onYearChange = vi.fn();
  const user = userEvent.setup();
  render(<Timeline year={-403} onYearChange={onYearChange} isPlaying={false} onPlayToggle={vi.fn()} />);

  await user.click(screen.getByText('历史转折快捷跳转'));
  await user.click(screen.getByRole('button', { name: '跳转到秦统一六国' }));
  expect(onYearChange).toHaveBeenCalledWith(-221);
});

test('event shortcut can open the shared event detail rather than only changing the year',async()=>{
  const select=vi.fn();
  render(<Timeline year={800} onYearChange={vi.fn()} isPlaying={false} onPlayToggle={vi.fn()} onEventSelect={select}/>);
  await userEvent.click(screen.getByText('历史转折快捷跳转'));
  await userEvent.click(screen.getByRole('button',{name:'跳转到赤壁之战'}));
  expect(select).toHaveBeenCalledWith(expect.objectContaining({id:'red-cliffs',year:208}));
});

test('focuses the chosen dynasty without changing the current year', async () => {
  const onYearChange = vi.fn();
  render(<Timeline year={800} onYearChange={onYearChange} isPlaying={false} onPlayToggle={vi.fn()} />);
  await userEvent.selectOptions(screen.getByRole('combobox'), 'ming');
  expect(onYearChange).not.toHaveBeenCalled();
  expect(screen.getByRole('slider')).toHaveAttribute('min', String(yearToIndex(1368)));
  expect(screen.getByRole('slider')).toHaveAttribute('max', String(yearToIndex(1644)));
});

test('exposes a semantic back action after a range drill-down', async () => {
  const onBackView = vi.fn();
  render(<Timeline year={800} onYearChange={vi.fn()} isPlaying={false} onPlayToggle={vi.fn()} viewLabel="《资治通鉴》" canGoBack onBackView={onBackView} />);
  expect(screen.getByRole('button', { name: '返回上一级' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '返回上一级' }));
  expect(onBackView).toHaveBeenCalledOnce();
});

test('selects the Tongjian range without removing access to all history', async () => {
  render(<Timeline year={800} onYearChange={vi.fn()} isPlaying={false} onPlayToggle={vi.fn()} />);
  await userEvent.click(screen.getByRole('button', { name: '聚焦资治通鉴 前403年至959年' }));
  expect(screen.getByRole('slider')).toHaveAttribute('min', String(yearToIndex(-403)));
  expect(screen.getByRole('slider')).toHaveAttribute('max', String(yearToIndex(959)));
  await userEvent.click(screen.getByRole('button', { name: '全历史' }));
  expect(screen.getByRole('slider')).toHaveAttribute('min', String(yearToIndex(-8000)));
  expect(screen.getByRole('slider')).toHaveAttribute('max', String(yearToIndex(2026)));
});

test('adds range mini-charts and measured scale glyphs without replacing labels', () => {
  render(<Timeline year={800} onYearChange={vi.fn()} isPlaying={false} onPlayToggle={vi.fn()} />);
  expect(screen.getByRole('button', { name: '全历史' }).querySelector('.range-glyph')).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: '选择朝代并放大时间轴' }).previousElementSibling).toHaveClass('period-select-glyph');
  expect(screen.getByRole('button', { name: '放大时间轴' })).toHaveClass('timeline-glyph-button');
});

test('validates a complete input instead of jumping as each digit is typed', async () => {
  const onYearChange = vi.fn();
  render(<Timeline year={800} onYearChange={onYearChange} isPlaying={false} onPlayToggle={vi.fn()} />);
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
  render(<Timeline year={800} onYearChange={vi.fn()} isPlaying={false} onPlayToggle={vi.fn()} />);
  await userEvent.click(screen.getByRole('button', { name: '逐年' }));
  await userEvent.click(screen.getByRole('button', { name: '时间轴向后平移' }));
  expect(Number(screen.getByRole('slider').getAttribute('min'))).toBeGreaterThan(yearToIndex(800));
  await userEvent.click(screen.getByRole('button', { name: '前往' }));
  expect(Number(screen.getByRole('slider').getAttribute('min'))).toBeLessThanOrEqual(yearToIndex(800));
  expect(Number(screen.getByRole('slider').getAttribute('max'))).toBeGreaterThanOrEqual(yearToIndex(800));
});

test('can move directly to the next available source change', async () => {
  const change=vi.fn();
  render(<Timeline year={-213} onYearChange={change} isPlaying={false} onPlayToggle={vi.fn()} />);
  await userEvent.click(screen.getByRole('button',{name:'下一资料变化'}));
  expect(change).toHaveBeenCalledWith(-212);
});
