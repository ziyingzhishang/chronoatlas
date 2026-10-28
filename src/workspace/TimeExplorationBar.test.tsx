import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { LocaleProvider } from '../i18n/locale';
import '../styles/workspace.css';
import { TimeExplorationBar, type TimeExplorationBarProps } from './TimeExplorationBar';

afterEach(() => localStorage.clear());

const baseProps: TimeExplorationBarProps = {
  year: 800,
  eraLabel: '唐',
  viewWindow: [-2070, 2026],
  isPlaying: false,
  presentation: 'wide',
  analysisOpen: false,
  onYearChange: vi.fn(),
  onYearCommit: vi.fn(),
  onPlayToggle: vi.fn(),
  onOpenAnalysis: vi.fn(),
};

function renderBar(overrides: Partial<TimeExplorationBarProps> = {}) {
  const props = { ...baseProps, ...overrides };
  return { props, ...render(<LocaleProvider><TimeExplorationBar {...props}/></LocaleProvider>) };
}

describe('TimeExplorationBar', () => {
  test('wide presentation shows compact context, primary controls, scrubber and one analysis entry', () => {
    renderBar();

    expect(screen.getByRole('group', { name: /时间探索.*800年.*唐/ })).toHaveClass('time-exploration-bar');
    expect(screen.getByText('800年')).toBeInTheDocument();
    expect(screen.getByText('唐')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '上一年' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下一年' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '播放' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: '快速浏览年份' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '打开时间轴' })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: '刻度' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '展开' })).not.toBeInTheDocument();
  });

  test('mobile omits duplicated visual year context but keeps it in the accessible group name', () => {
    renderBar({ year: -1, eraLabel: '西汉', presentation: 'mobile' });

    expect(screen.getByRole('group', { name: /时间探索.*前1年.*西汉/ })).toBeInTheDocument();
    expect(screen.queryByText('前1年')).not.toBeInTheDocument();
    expect(screen.queryByText('西汉')).not.toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '打开时间轴' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: '打开时间轴' })).toHaveAttribute('aria-controls', 'time-analysis-panel');
  });

  test('narrow keeps compact year and era context without the wide scrubber', () => {
    renderBar({ presentation: 'narrow' });
    expect(screen.getByText('800年')).toBeInTheDocument();
    expect(screen.getByText('唐')).toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  test('manual stepping crosses the absent year zero and uses the commit path', async () => {
    const onYearChange = vi.fn();
    const onYearCommit = vi.fn();
    renderBar({ year: -1, onYearChange, onYearCommit });

    await userEvent.click(screen.getByRole('button', { name: '下一年' }));

    expect(onYearChange).toHaveBeenCalledWith(1);
    expect(onYearCommit).toHaveBeenCalledWith(1);
  });

  test('wide scrub previews on input and commits only on change', () => {
    const onYearChange = vi.fn();
    const onYearCommit = vi.fn();
    renderBar({ onYearChange, onYearCommit });
    const slider = screen.getByRole('slider', { name: '快速浏览年份' });

    fireEvent.input(slider, { target: { value: '8000' } });
    expect(onYearChange).toHaveBeenLastCalledWith(1);
    expect(onYearCommit).not.toHaveBeenCalled();

    fireEvent.change(slider, { target: { value: '8000' } });
    expect(onYearCommit).toHaveBeenLastCalledWith(1);
  });

  test('uses a 52px bar contract and 44px interactive targets', () => {
    renderBar();
    const bar = screen.getByRole('group', { name: /时间探索/ });
    expect(bar).toHaveClass('time-exploration-bar');
    expect(getComputedStyle(bar).height).toBe('52px');
    expect(getComputedStyle(bar).minHeight).toBe('52px');
    expect(getComputedStyle(screen.getByRole('button', { name: '播放' })).minHeight).toBe('44px');
    expect(getComputedStyle(screen.getByRole('slider', { name: '快速浏览年份' })).height).toBe('44px');
  });
});
