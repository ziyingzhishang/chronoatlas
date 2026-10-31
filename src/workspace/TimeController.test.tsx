import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { TimeController } from './TimeController';

const defaultResizeObserver = globalThis.ResizeObserver;
function Demo(){const [year,setYear]=useState(-1);return <TimeController year={year} onYearChange={setYear} isPlaying={false} onPlayToggle={()=>{}}/>;}
afterEach(()=>{localStorage.clear();vi.unstubAllGlobals();vi.stubGlobal('ResizeObserver',defaultResizeObserver);vi.restoreAllMocks();});
test('collapsed controller preserves the year and exposes a compact historical range slider',async()=>{
  const { container } = render(<Demo/>);
  expect(screen.getByRole('group', { name: '简明时间控制' })).toHaveTextContent('前1年');
  expect(container.querySelector('.controller-content')).toBeInTheDocument();
  expect((container.querySelector('.time-controller') as HTMLElement).style.height).toBe('50px');
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  expect(screen.getByRole('slider', { name: '选择历史年份' })).toBeVisible();
  expect(screen.queryByRole('button',{name:'上一年'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'下一年'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'播放'})).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button',{name:'悬浮时间控制器'}));
  Object.defineProperty(document.querySelector('.controller-content'), 'scrollHeight', { configurable: true, value: 600 });
  await userEvent.click(screen.getByRole('button',{name:'展开时间控制器'}));
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '前1年');
  await userEvent.click(screen.getByRole('button',{name:'收起时间控制器'}));
  expect(container.querySelector('.controller-content')).toBeInTheDocument();
  expect(screen.getByRole('slider', { name: '选择历史年份' })).toBeVisible();
  expect(screen.queryByRole('button',{name:'下一年'})).not.toBeInTheDocument();
});

test('collapsed rail selects years from the active time window', async () => {
  const onYearChange = vi.fn();
  const onYearCommit=vi.fn();
  const {container}=render(<TimeController year={800} onYearChange={onYearChange} onYearCommit={onYearCommit} isPlaying={false} onPlayToggle={()=>{}} viewWindow={[618, 907]}/>);
  const slider=screen.getByRole('slider', { name: '选择历史年份' });
  expect(Number(slider.getAttribute('min'))).toBeGreaterThan(0);
  expect(Number(slider.getAttribute('max'))).toBeGreaterThan(Number(slider.getAttribute('min')));
  const segments=[...container.querySelectorAll<HTMLElement>('.collapsed-year-segments i')];
  expect(segments.length).toBeGreaterThan(1);
  expect(segments[0].style.left).toBe('0%');
  expect(Number.parseFloat(segments[1].style.left)).toBeGreaterThan(Number.parseFloat(segments[0].style.left));
  fireEvent.input(slider,{target:{value:String(Number(slider.getAttribute('min'))+8)}});
  expect(onYearChange).toHaveBeenCalled();
  fireEvent.change(slider);
  expect(onYearCommit).toHaveBeenCalledWith(onYearChange.mock.lastCall?.[0]);
});
test('mobile forces docking without discarding the desktop preference',()=>{
  localStorage.setItem('history-workspace-v1',JSON.stringify({mode:'floating',position:{x:80,y:100}}));
  Object.defineProperty(window,'innerWidth',{configurable:true,value:390,writable:true});
  const { container } = render(<Demo/>);
  expect(screen.queryByRole('button',{name:'停靠时间控制器'})).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'展开时间控制器'})).toBeInTheDocument();
  expect(container.querySelector('.time-controller')).toHaveStyle({ maxHeight: '30dvh' });
  window.innerWidth=1200;fireEvent(window,new Event('resize'));
  expect(screen.getByRole('button',{name:'停靠时间控制器'})).toBeInTheDocument();
});

test('exploration HUD keeps the controller label visually compact while retaining an accessible name', () => {
  render(<Demo />);
  expect(screen.getByRole('button', { name: '切换时间控制器密度' })).toBeInTheDocument();
  expect(screen.getByText('时间导航')).toHaveClass('controller-title');
});

test('floating controller opens 60px above the pane bottom', async () => {
  const { container } = render(<Demo />);
  await userEvent.click(screen.getByRole('button', { name: '悬浮时间控制器' }));
  expect(container.querySelector<HTMLElement>('.time-controller')).toHaveStyle({ top: `${window.innerHeight - 50 - 60}px` });
});

test('collapsing a floating controller returns its compact bar to the bottom position', async () => {
  localStorage.setItem('history-workspace-v1', JSON.stringify({ mode: 'floating', position: { x: 80, y: 100 }, panelHeight: 220 }));
  const observers: Array<{ callback: ResizeObserverCallback; targets: Element[] }> = [];
  class ControlledResizeObserver {
    targets: Element[] = [];
    constructor(readonly callback: ResizeObserverCallback) { observers.push(this); }
    observe(target: Element) { this.targets.push(target); }
    unobserve(target: Element) { this.targets = this.targets.filter(item => item !== target); }
    disconnect() { this.targets = []; }
  }
  vi.stubGlobal('ResizeObserver', ControlledResizeObserver);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains('time-controller')) return { x: 80, y: 100, left: 80, top: 100, right: 840, bottom: 320, width: 760, height: 220, toJSON: () => ({}) };
    return { x: 0, y: 0, left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight, width: window.innerWidth, height: window.innerHeight, toJSON: () => ({}) };
  });
  const { container } = render(<Demo />);
  await userEvent.click(screen.getByRole('button', { name: '收起时间控制器' }));
  const controller = container.querySelector('.time-controller')!;
  observers.filter(observer => observer.targets.includes(controller) && observer.targets.includes(controller.parentElement!))
    .at(-1)?.callback([], observers.at(-1) as unknown as ResizeObserver);
  expect(container.querySelector<HTMLElement>('.time-controller')).toHaveStyle({
    top: `${window.innerHeight - 50 - 60}px`,
    height: '50px'
  });
});

test('floating mode clamps to the containing map pane instead of the viewport', () => {
  localStorage.setItem('history-workspace-v1', JSON.stringify({ mode: 'floating', position: { x: 900, y: 100 } }));
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains('map-pane-fixture')) return { x: 0, y: 0, left: 0, top: 0, right: 600, bottom: 500, width: 600, height: 500, toJSON: () => ({}) };
    return { x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100, toJSON: () => ({}) };
  });
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  observedResizes = [];
});

function renderController(overrides: Record<string, unknown> = {}) {
  return render(<div className="map-pane-fixture"><TimeController {...baseProps} {...overrides}/></div>);
}

test('orchestrates only bar and analysis without legacy density controls', async () => {
  const { container } = renderController();
  expect(screen.getByRole('group', { name: /时间探索/ })).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: '时间分析' })).not.toBeInTheDocument();
  expect(container.querySelector('[data-density]')).not.toBeInTheDocument();
  expect(screen.queryByText('刻度')).not.toBeInTheDocument();
  expect(screen.queryByText('展开')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: '打开时间轴' }));
  expect(screen.getByRole('region', { name: '时间分析' })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: '播放' })).toHaveLength(1);
  expect(screen.getByRole('button', { name: '打开时间轴' })).toHaveAttribute('aria-expanded', 'true');
});

test('dragging the top handle upward opens and expands the analysis panel', async () => {
  const { container } = renderController();
  const handle = screen.getByRole('separator', { name: '调整时间控制器高度' });
  const pointer = (type: string, clientY: number) => {
    const event = new MouseEvent(type, { bubbles: true, button: 0, clientY });
    Object.defineProperty(event, 'pointerId', { value: 21 });
    fireEvent(handle, event);
  };

  pointer('pointerdown', 400);
  pointer('pointermove', 280);

  await waitFor(() => expect(screen.getByRole('region', { name: '时间分析' })).toBeInTheDocument());
  expect(container.querySelector<HTMLElement>('.time-controller')).toHaveStyle({ height: '172px' });
  pointer('pointerup', 280);
});

test('dragging the top handle downward collapses the analysis panel', async () => {
  const { container } = renderController();
  await userEvent.click(screen.getByRole('button', { name: '打开时间轴' }));
  const handle = screen.getByRole('separator', { name: '调整时间控制器高度' });
  const pointer = (type: string, clientY: number) => {
    const event = new MouseEvent(type, { bubbles: true, button: 0, clientY });
    Object.defineProperty(event, 'pointerId', { value: 22 });
    fireEvent(handle, event);
  };

  pointer('pointerdown', 300);
  pointer('pointermove', 520);
  pointer('pointerup', 520);

  await waitFor(() => expect(screen.queryByRole('region', { name: '时间分析' })).not.toBeInTheDocument());
  expect(container.querySelector<HTMLElement>('.time-controller')?.style.height).toBe('');
});

test('floating top-handle resizing keeps the panel bottom edge anchored', async () => {
  localStorage.setItem('history-workspace-v1', JSON.stringify({ mode: 'floating', position: { x: 80, y: 100 } }));
  const { container } = renderController();
  await userEvent.click(screen.getByRole('button', { name: '打开时间轴' }));
  const panel = container.querySelector<HTMLElement>('.time-controller')!;
  const handle = screen.getByRole('separator', { name: '调整时间控制器高度' });
  const bottomBefore = Number.parseFloat(panel.style.top || '100') + Number.parseFloat(panel.style.height || '220');
  const pointer = (type: string, clientY: number) => {
    const event = new MouseEvent(type, { bubbles: true, button: 0, clientY });
    Object.defineProperty(event, 'pointerId', { value: 23 });
    fireEvent(handle, event);
  };

  pointer('pointerdown', 200);
  pointer('pointermove', 240);

  expect(Number.parseFloat(panel.style.top) + Number.parseFloat(panel.style.height)).toBe(bottomBefore);
  pointer('pointerup', 240);
});

test('floating resize observation uses target height instead of the transition height', async () => {
  localStorage.setItem('history-workspace-v1', JSON.stringify({ mode: 'floating', position: { x: 80, y: 480 } }));
  const { container } = renderController();
  await userEvent.click(screen.getByRole('button', { name: '打开时间轴' }));
  const panel = container.querySelector<HTMLElement>('.time-controller')!;
  const handle = screen.getByRole('separator', { name: '调整时间控制器高度' });
  const pointer = (type: string, clientY: number) => {
    const event = new MouseEvent(type, { bubbles: true, button: 0, clientY });
    Object.defineProperty(event, 'pointerId', { value: 24 });
    fireEvent(handle, event);
  };

  pointer('pointerdown', 200);
  pointer('pointermove', 280);
  act(() => observedResizes.at(-1)?.([], {} as ResizeObserver));

  const top = Number.parseFloat(panel.style.top);
  const height = Number.parseFloat(panel.style.height);
  expect(top + height).toBe(700);
  pointer('pointerup', 280);
});

test('floating resize clamps at its maximum while preserving the bounded bottom edge', async () => {
  localStorage.setItem('history-workspace-v1', JSON.stringify({ mode: 'floating', position: { x: 80, y: 500 } }));
  const { container } = renderController();
  await userEvent.click(screen.getByRole('button', { name: '打开时间轴' }));
  const panel = container.querySelector<HTMLElement>('.time-controller')!;
  const handle = screen.getByRole('separator', { name: '调整时间控制器高度' });
  const pointer = (type: string, clientY: number) => {
    const event = new MouseEvent(type, { bubbles: true, button: 0, clientY });
    Object.defineProperty(event, 'pointerId', { value: 25 });
    fireEvent(handle, event);
  };

  pointer('pointerdown', 200);
  pointer('pointermove', -1000);

  expect(panel.style.height).toBe('520px');
  expect(Number.parseFloat(panel.style.top) + Number.parseFloat(panel.style.height)).toBe(720);
  pointer('pointerup', -1000);
});

test('keyboard floating resize follows the same bottom anchored rule', () => {
  localStorage.setItem('history-workspace-v1', JSON.stringify({ mode: 'floating', position: { x: 80, y: 100 } }));
  const { container } = renderController();
  const panel = container.querySelector<HTMLElement>('.time-controller')!;
  const handle = screen.getByRole('separator', { name: '调整时间控制器高度' });

  fireEvent.keyDown(handle, { key: 'ArrowUp' });

  expect(panel.style.height).toBe('76px');
  expect(Number.parseFloat(panel.style.top) + Number.parseFloat(panel.style.height)).toBe(152);
});

test('floating panel repositions inside the resized pane using its target height', async () => {
  localStorage.setItem('history-workspace-v1', JSON.stringify({ mode: 'floating', position: { x: 80, y: 400 } }));
  const { container } = renderController();
  await userEvent.click(screen.getByRole('button', { name: '打开时间轴' }));
  const panel = container.querySelector<HTMLElement>('.time-controller')!;

  paneRect = { width: 900, height: 600 };
  act(() => observedResizes.forEach((callback) => callback([], {} as ResizeObserver)));

  expect(Number.parseFloat(panel.style.top) + Number.parseFloat(panel.style.height)).toBe(536);
});

test('supports a controlled analysis state so the workspace can coordinate transient surfaces', async () => {
  const onAnalysisOpenChange = vi.fn();
  const { rerender } = renderController({ analysisOpen: false, onAnalysisOpenChange });

  await userEvent.click(screen.getByRole('button', { name: '打开时间轴' }));
  expect(onAnalysisOpenChange).toHaveBeenCalledWith(true);
  expect(screen.queryByRole('region', { name: '时间分析' })).not.toBeInTheDocument();

  rerender(<div className="map-pane-fixture"><TimeController {...baseProps} analysisOpen onAnalysisOpenChange={onAnalysisOpenChange}/></div>);
  expect(screen.getByRole('region', { name: '时间分析' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: '关闭时间分析' }));
  expect(onAnalysisOpenChange).toHaveBeenLastCalledWith(false);
});

test('close and Escape restore focus without changing the selected year or view', async () => {
  const onYearChange = vi.fn();
  const onViewWindowChange = vi.fn();
  renderController({ onYearChange, onViewWindowChange });
  const open = screen.getByRole('button', { name: '打开时间轴' });

  await userEvent.click(open);
  await userEvent.click(screen.getByRole('button', { name: '关闭时间分析' }));
  await waitFor(() => expect(open).toHaveFocus());
  expect(onYearChange).not.toHaveBeenCalled();
  expect(onViewWindowChange).not.toHaveBeenCalled();

  await userEvent.click(open);
  await userEvent.keyboard('{Escape}');
  expect(screen.queryByRole('region', { name: '时间分析' })).not.toBeInTheDocument();
  await waitFor(() => expect(open).toHaveFocus());
});

test('wide panes expose floating layout only inside advanced tools', async () => {
  renderController();
  expect(screen.queryByRole('group', { name: '布局' })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '打开时间轴' }));
  const advanced = screen.getByText('更多时间工具').closest('details');
  expect(advanced).not.toHaveAttribute('open');
  expect(screen.getByRole('button', { name: '悬浮时间控制器' }).closest('details')).toBe(advanced);
  await userEvent.click(screen.getByText('更多时间工具'));
  expect(advanced).toHaveAttribute('open');
  const layout = screen.getByRole('group', { name: '布局' });
  expect(layout).toContainElement(screen.getByRole('button', { name: '悬浮时间控制器' }));
});

test.each([
  ['narrow', 560, 800],
  ['portrait tablet', 809, 934],
  ['mobile', 390, 844],
  ['short', 844, 390],
] as const)('%s panes ignore a stored floating preference and hide layout tools', async (_name, width, height) => {
  paneRect = { width, height };
  localStorage.setItem('history-workspace-v1', JSON.stringify({ mode: 'floating', position: { x: 80, y: 100 } }));
  const { container } = renderController();
  expect(container.querySelector('.time-controller')).toHaveClass('is-docked');
  await userEvent.click(screen.getByRole('button', { name: '打开时间轴' }));
  expect(screen.queryByText('更多时间工具')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '停靠时间控制器' })).not.toBeInTheDocument();
});

test('pane-only resizing immediately disables a stored floating layout', () => {
  localStorage.setItem('history-workspace-v1', JSON.stringify({ mode: 'floating', position: { x: 80, y: 100 } }));
  const { container } = renderController();
  expect(container.querySelector('.time-controller')).toHaveClass('is-floating');
  paneRect = { width: 560, height: 800 };
  act(() => observedResizes.forEach((callback) => callback([], {} as ResizeObserver)));
  expect(container.querySelector('.time-controller')).toHaveClass('is-docked');
});

test('bar stepping crosses directly from 1 BCE to 1 CE', async () => {
  const onYearChange = vi.fn();
  const onYearCommit = vi.fn();
  renderController({ year: -1, onYearChange, onYearCommit });
  await userEvent.click(screen.getByRole('button', { name: '下一年' }));
  expect(onYearChange).toHaveBeenCalledWith(1);
  expect(onYearCommit).toHaveBeenCalledWith(1);
});

test('supports local range navigation when the view window is uncontrolled', async () => {
  renderController({ viewWindow: undefined });
  await userEvent.click(screen.getByRole('button', { name: '打开时间轴' }));
  await userEvent.click(screen.getByRole('button', { name: '全历史' }));
  expect(screen.getByRole('slider', { name: '选择历史年份' })).toHaveAttribute('min', '0');
});

test('floating drag remains available only from the wide analysis layout group', async () => {
  renderController();
  await userEvent.click(screen.getByRole('button', { name: '打开时间轴' }));
  await userEvent.click(screen.getByText('更多时间工具'));
  await userEvent.click(screen.getByRole('button', { name: '悬浮时间控制器' }));
  const grip = screen.getByRole('button', { name: '移动时间控制器' });
  fireEvent.pointerDown(grip, { button: 0, pointerId: 1, clientX: 20, clientY: 20 });
  fireEvent.pointerMove(grip, { pointerId: 1, clientX: 40, clientY: 50 });
  fireEvent.pointerUp(grip, { pointerId: 1, clientX: 40, clientY: 50 });
  expect(screen.getByRole('button', { name: '停靠时间控制器' })).toBeInTheDocument();
});

test('expanded controller exposes a keyboard-resizable panel handle', async () => {
  render(<Demo />);
  Object.defineProperty(document.querySelector('.controller-content'), 'scrollHeight', { configurable: true, value: 600 });
  const resizeHandle = screen.getByRole('separator', { name: '调整时间控制器高度' });
  expect(resizeHandle).toHaveAttribute('aria-valuemin', '50');
  resizeHandle.focus();
  await userEvent.keyboard('{ArrowUp}');
  expect(Number(resizeHandle.getAttribute('aria-valuenow'))).toBeGreaterThan(50);
  expect(JSON.parse(localStorage.getItem('history-workspace-v1') ?? '{}').panelHeight).toBeGreaterThan(50);
});

test('collapsed panel can be dragged open from its resize handle without switching density stops', async () => {
  render(<Demo />);
  Object.defineProperty(document.querySelector('.controller-content'), 'scrollHeight', { configurable: true, value: 600 });
  const resizeHandle = screen.getByRole('separator', { name: '调整时间控制器高度' });
  expect(resizeHandle).toHaveAttribute('aria-valuenow', '50');
  resizeHandle.focus();
  await userEvent.keyboard('{ArrowUp}');
  expect(Number(resizeHandle.getAttribute('aria-valuenow'))).toBeGreaterThan(50);
});

test('panel resize keeps the map layout slot in flow and follows every drag update', async() => {
  const onResizeInteractionChange=vi.fn();
  const {container}=render(<TimeController year={800} onYearChange={()=>{}} isPlaying={false} onPlayToggle={()=>{}} onResizeInteractionChange={onResizeInteractionChange}/>);
  const handle=screen.getByRole('separator',{name:'调整时间控制器高度'});
  const pointer=(type:string,clientY:number)=>{const event=new MouseEvent(type,{bubbles:true,button:0,clientY});Object.defineProperty(event,'pointerId',{value:3});fireEvent(handle,event);};
  pointer('pointerdown',200);
  expect(onResizeInteractionChange).toHaveBeenLastCalledWith(true);
  expect(container.querySelector<HTMLElement>('.time-controller')).not.toHaveStyle({position:'absolute'});
  expect(container.querySelector('.time-controller-resize-placeholder')).not.toBeInTheDocument();
  pointer('pointermove',150);
  await waitFor(()=>expect(Number(handle.getAttribute('aria-valuenow'))).toBe(100));
  expect(container.querySelector<HTMLElement>('.time-controller')).toHaveStyle({height:'100px'});
  pointer('pointermove',130);
  await waitFor(()=>expect(Number(handle.getAttribute('aria-valuenow'))).toBe(120));
  expect(container.querySelector<HTMLElement>('.time-controller')).toHaveStyle({height:'120px'});
  pointer('pointerup',130);
  expect(onResizeInteractionChange).toHaveBeenLastCalledWith(false);
  expect(container.querySelector('.time-controller-resize-placeholder')).toBeNull();
  expect(container.querySelector<HTMLElement>('.time-controller')).toHaveStyle({height:'120px'});
});

test('floating resize dragged down keeps the bottom edge fixed while the top follows down', async()=>{
  localStorage.setItem('history-workspace-v1',JSON.stringify({mode:'floating',position:{x:80,y:100},panelHeight:150}));
  const {container}=render(<Demo/>);
  const panel=container.querySelector<HTMLElement>('.time-controller')!;
  Object.defineProperty(panel.querySelector('.controller-content'),'scrollHeight',{configurable:true,value:600});
  const handle=screen.getByRole('separator',{name:'调整时间控制器高度'});
  const pointer=(type:string,clientY:number)=>{const event=new MouseEvent(type,{bubbles:true,button:0,clientY});Object.defineProperty(event,'pointerId',{value:4});fireEvent(handle,event);};
  pointer('pointerdown',200);
  pointer('pointermove',230);
  await waitFor(()=>expect(panel).toHaveStyle({top:'130px',height:'120px'}));
  expect(Number.parseInt(panel.style.top)+Number.parseInt(panel.style.height)).toBe(250);
  pointer('pointerup',230);
});

test('floating resize dragged up grows from the top while keeping the bottom edge fixed', async()=>{
  localStorage.setItem('history-workspace-v1',JSON.stringify({mode:'floating',position:{x:80,y:200},panelHeight:150}));
  const {container}=render(<Demo/>);
  const panel=container.querySelector<HTMLElement>('.time-controller')!;
  Object.defineProperty(panel.querySelector('.controller-content'),'scrollHeight',{configurable:true,value:600});
  const handle=screen.getByRole('separator',{name:'调整时间控制器高度'});
  const pointer=(type:string,clientY:number)=>{const event=new MouseEvent(type,{bubbles:true,button:0,clientY});Object.defineProperty(event,'pointerId',{value:5});fireEvent(handle,event);};
  pointer('pointerdown',200);
  pointer('pointermove',150);
  await waitFor(()=>expect(panel).toHaveStyle({top:'150px',height:'200px'}));
  expect(Number.parseInt(panel.style.top)+Number.parseInt(panel.style.height)).toBe(350);
  pointer('pointerup',150);
});

test('floating resize respects pane top and bottom boundaries while keeping the bottom anchored', async()=>{
  localStorage.setItem('history-workspace-v1',JSON.stringify({mode:'floating',position:{x:80,y:108},panelHeight:600}));
  const originalScrollHeight=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'scrollHeight');
  Object.defineProperty(HTMLElement.prototype,'scrollHeight',{configurable:true,get(){return this.classList?.contains('controller-content')?1000:0;}});
  try {
    const {container}=render(<Demo/>);
    const panel=container.querySelector<HTMLElement>('.time-controller')!;
    const handle=screen.getByRole('separator',{name:'调整时间控制器高度'});
    const pointer=(type:string,clientY:number)=>{const event=new MouseEvent(type,{bubbles:true,button:0,clientY});Object.defineProperty(event,'pointerId',{value:6});fireEvent(handle,event);};
    pointer('pointerdown',200);
    pointer('pointermove',-500);
    await waitFor(()=>expect(panel).toHaveStyle({top:'64px',height:'644px'}));
    expect(Number.parseInt(panel.style.top)+Number.parseInt(panel.style.height)).toBe(708);
    pointer('pointerup',-500);
  } finally {
    if(originalScrollHeight)Object.defineProperty(HTMLElement.prototype,'scrollHeight',originalScrollHeight);
    else Reflect.deleteProperty(HTMLElement.prototype,'scrollHeight');
  }
});

test('floating keyboard resize keeps the bottom edge fixed for both arrow directions', async()=>{
  localStorage.setItem('history-workspace-v1',JSON.stringify({mode:'floating',position:{x:80,y:100},panelHeight:150}));
  const {container}=render(<Demo/>);
  const panel=container.querySelector<HTMLElement>('.time-controller')!;
  Object.defineProperty(panel.querySelector('.controller-content'),'scrollHeight',{configurable:true,value:600});
  const handle=screen.getByRole('separator',{name:'调整时间控制器高度'});
  handle.focus();
  await userEvent.keyboard('{ArrowUp}');
  expect(panel).toHaveStyle({top:'76px',height:'174px'});
  await userEvent.keyboard('{ArrowDown}');
  expect(panel).toHaveStyle({top:'100px',height:'150px'});
  expect(Number.parseInt(panel.style.top)+Number.parseInt(panel.style.height)).toBe(250);
});

test('restores a saved intermediate panel height and constrains it after a short viewport resize', async()=>{
  const originalWidth=window.innerWidth;
  const originalHeight=window.innerHeight;
  const originalScrollHeight=Object.getOwnPropertyDescriptor(HTMLElement.prototype,'scrollHeight');
  Object.defineProperty(HTMLElement.prototype,'scrollHeight',{configurable:true,get(){return this.classList?.contains('controller-content')?600:0;}});
  localStorage.setItem('history-workspace-v1',JSON.stringify({mode:'docked',position:{x:24,y:80},panelHeight:220}));
  Object.defineProperty(window,'innerWidth',{configurable:true,value:1440,writable:true});
  Object.defineProperty(window,'innerHeight',{configurable:true,value:900,writable:true});
  const {container}=render(<Demo/>);
  const panel=container.querySelector<HTMLElement>('.time-controller')!;
  expect(panel).toHaveStyle({height:'220px'});

  Object.defineProperty(window,'innerHeight',{configurable:true,value:480,writable:true});
  fireEvent(window,new Event('resize'));
  await waitFor(()=>expect(panel).toHaveStyle({height:'144px',maxHeight:'30dvh'}));
  expect(JSON.parse(localStorage.getItem('history-workspace-v1')??'{}').panelHeight).toBe(144);
  Object.defineProperty(window,'innerWidth',{configurable:true,value:originalWidth,writable:true});
  Object.defineProperty(window,'innerHeight',{configurable:true,value:originalHeight,writable:true});
  fireEvent(window,new Event('resize'));
  if(originalScrollHeight)Object.defineProperty(HTMLElement.prototype,'scrollHeight',originalScrollHeight);
  else Reflect.deleteProperty(HTMLElement.prototype,'scrollHeight');
});

test('expanded timeline exposes only one primary year and playback control set',async()=>{
  render(<TimeController year={800} onYearChange={()=>{}} isPlaying={false} onPlayToggle={()=>{}}/>);
  await userEvent.click(screen.getByRole('button',{name:'展开时间控制器'}));
  expect(screen.getByRole('slider')).toBeInTheDocument();
  expect(screen.getAllByRole('button',{name:'播放'})).toHaveLength(1);
  expect(screen.getAllByRole('button',{name:'上一年'})).toHaveLength(1);
  expect(screen.getAllByRole('button',{name:'下一年'})).toHaveLength(1);
  expect(screen.queryByRole('button',{name:'精简时间控制器'})).not.toBeInTheDocument();
});
