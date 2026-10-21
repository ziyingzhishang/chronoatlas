import { render,screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect,test,vi } from 'vitest';
import type { HistoricalEvent } from '../domain/types';
import { EventExplorer } from './EventExplorer';
const items:HistoricalEvent[]=[{id:'transition',year:-1,endYear:1,title:'跨年转折',summary:'持续的变化',sourceIds:[],region:'china',category:'政权更替',background:'背景说明',process:'主要过程',impact:'后续影响',mapNote:'无同年疆域',verification:'partial',references:[{title:'原始记载',url:'https://example.org/history'}]}, {id:'other',year:100,title:'世界事件',summary:'远方变化',sourceIds:[],region:'world',category:'战争',coordinates:[10,20],locationPrecision:'approximate'}];
test('search finds events outside the selected year and does not mix nearby events into the current year',async()=>{
  const select=vi.fn();
  render(<EventExplorer items={items} year={50} onSelect={select} onYearChange={()=>{}}/>);
  expect(screen.getByText('本年暂无已收录事件')).toBeInTheDocument();
  expect(screen.queryByRole('button',{name:/跨年转折/})).not.toBeInTheDocument();
  await userEvent.type(screen.getByRole('searchbox',{name:'搜索历史事件'}),'跨年');
  await userEvent.click(screen.getByRole('button',{name:/跨年转折/}));
  expect(select).toHaveBeenCalledWith(items[0]);
  await userEvent.selectOptions(screen.getByRole('combobox',{name:'事件地域'}),'world');
  expect(screen.getByText('没有符合筛选条件的事件')).toBeInTheDocument();
});
test('event details expose evidence and uncertainty without inventing a location; before/after skips zero',async()=>{
  const year=vi.fn();
  render(<EventExplorer items={items} year={1} selectedId="transition" onSelect={()=>{}} onYearChange={year}/>);
  expect(screen.getByText('背景说明')).toBeInTheDocument();
  expect(screen.getByRole('link',{name:'原始记载'})).toHaveAttribute('href','https://example.org/history');
  expect(screen.queryByRole('button',{name:/定位/})).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'事件前一年'}));
  expect(year).toHaveBeenCalledWith(-2);
  await userEvent.click(screen.getByRole('button',{name:'事件后一年'}));
  expect(year).toHaveBeenCalledWith(2);
});

test('returns from event detail to the filtered list', async () => {
  const onBackToList = vi.fn();
  render(<EventExplorer items={items} year={1} selectedId="transition" onSelect={vi.fn()} onYearChange={vi.fn()} onBackToList={onBackToList} />);

  await userEvent.click(screen.getByRole('button', { name: /返回事件列表/ }));

  expect(onBackToList).toHaveBeenCalledOnce();
});
