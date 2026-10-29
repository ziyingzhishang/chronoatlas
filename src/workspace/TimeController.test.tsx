import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { TimeController } from './TimeController';

let paneRect = { width: 900, height: 800 };
let observedResizes: ResizeObserverCallback[] = [];

const baseProps = {
  year: 800,
  eraLabel: '唐',
  viewWindow: [-2070, 2026] as [number, number],
  onYearChange: vi.fn(),
  onYearCommit: vi.fn(),
  isPlaying: false,
  onPlayToggle: vi.fn(),
};

beforeEach(() => {
  paneRect = { width: 900, height: 800 };
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const size = this.classList.contains('map-pane-fixture') ? paneRect : { width: 420, height: 220 };
    return { ...size, x: 0, y: 0, top: 0, left: 0, right: size.width, bottom: size.height, toJSON: () => ({}) };
  });
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: ResizeObserverCallback) { observedResizes.push(callback); }
    observe() {}
    unobserve() {}
    disconnect() {}
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
