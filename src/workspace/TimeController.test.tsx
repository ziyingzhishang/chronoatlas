import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { TimeController } from './TimeController';

function Demo(){const [year,setYear]=useState(-1);return <TimeController year={year} onYearChange={setYear} isPlaying={false} onPlayToggle={()=>{}}/>;}
afterEach(()=>localStorage.clear());
test('density and docking preserve year and allow stepping over the absent year zero',async()=>{
  render(<Demo/>);
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'下一年'}));
  expect(screen.getByRole('heading',{name:'公元1年'})).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'悬浮时间控制器'}));
  await userEvent.click(screen.getByRole('button',{name:'展开时间控制器'}));
  expect(screen.getByRole('spinbutton')).toHaveValue(1);
  await userEvent.click(screen.getByRole('button',{name:'收起时间控制器'}));
  expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'下一年'})).toBeInTheDocument();
});
test('mobile forces docking without discarding the desktop preference',()=>{
  localStorage.setItem('history-workspace-v1',JSON.stringify({mode:'floating',position:{x:80,y:100}}));
  Object.defineProperty(window,'innerWidth',{configurable:true,value:390,writable:true});
  render(<Demo/>);
  expect(screen.queryByRole('button',{name:'停靠时间控制器'})).not.toBeInTheDocument();
  window.innerWidth=1200;fireEvent(window,new Event('resize'));
  expect(screen.getByRole('button',{name:'停靠时间控制器'})).toBeInTheDocument();
});

test('exploration HUD keeps the controller label visually compact while retaining an accessible name', () => {
  render(<Demo />);
  expect(screen.getByRole('button', { name: '切换时间控制器密度' })).toBeInTheDocument();
  expect(screen.getByText('时间导航')).toHaveClass('controller-title');
});

test('floating mode clamps to the containing map pane instead of the viewport', () => {
  localStorage.setItem('history-workspace-v1', JSON.stringify({ mode: 'floating', position: { x: 900, y: 100 } }));
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains('map-pane-fixture')) return { x: 0, y: 0, left: 0, top: 0, right: 600, bottom: 500, width: 600, height: 500, toJSON: () => ({}) };
    return { x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100, toJSON: () => ({}) };
  });

  render(<div className="map-pane-fixture"><Demo /></div>);

  expect(screen.getByText('时间导航').closest('.time-controller')).toHaveStyle({ left: '388px' });
  rect.mockRestore();
});
