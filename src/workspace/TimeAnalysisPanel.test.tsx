import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import type { TimelineAnnotationLayer } from './time-navigation-state';
import { TimeExplorationBar } from './TimeExplorationBar';
import { TimeAnalysisPanel } from './TimeAnalysisPanel';
import '../styles/theme.css';
import '../styles/workspace.css';

function AnnotationHarness() {
  const [layer, setLayer] = useState<TimelineAnnotationLayer>('none');
  return <TimeAnalysisPanel year={800} onYearChange={() => {}} annotationLayer={layer} onAnnotationLayerChange={setLayer} onClose={() => {}}/>;
}

test('analysis composition has one play action, no duplicate large year, and one timeline slider', () => {
  render(<>
    <TimeExplorationBar year={800} eraLabel="唐" viewWindow={[-2070, 2026]} isPlaying={false} presentation="wide" analysisOpen onYearChange={() => {}} onYearCommit={() => {}} onPlayToggle={() => {}} onOpenAnalysis={() => {}}/>
    <TimeAnalysisPanel year={800} onYearChange={() => {}} annotationLayer="none" onAnnotationLayerChange={() => {}} onClose={() => {}}/>
  </>);
  expect(screen.getAllByRole('button', { name: '播放' })).toHaveLength(1);
  expect(screen.queryByRole('heading', { level: 2, name: '800年' })).not.toBeInTheDocument();
  expect(screen.getAllByText(/当前视窗/)).toHaveLength(1);
  expect(screen.getAllByRole('slider', { name: '选择历史年份' })).toHaveLength(1);
  expect(screen.getByRole('group', { name: '时间注释' })).toBeInTheDocument();
});

test('annotation layers are mutually exclusive and inactive content is unmounted', async () => {
  render(<AnnotationHarness/>);
  expect(screen.queryByLabelText('时间轴事件标记')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('可用疆域断面')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '历史事件' }));
  expect(screen.getByLabelText('时间轴事件标记')).toBeInTheDocument();
  expect(screen.queryByLabelText('可用疆域断面')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '资料变化' }));
  expect(screen.queryByLabelText('时间轴事件标记')).not.toBeInTheDocument();
  expect(screen.getByLabelText('可用疆域断面')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '无' }));
  expect(screen.queryByLabelText('时间轴事件标记')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('可用疆域断面')).not.toBeInTheDocument();
});

test('close button and Escape request closing the analysis panel', async () => {
  const onClose = vi.fn();
  render(<TimeAnalysisPanel year={800} onYearChange={() => {}} annotationLayer="none" onAnnotationLayerChange={() => {}} onClose={onClose}/>);
  await userEvent.click(screen.getByRole('button', { name: '关闭时间分析' }));
  expect(onClose).toHaveBeenCalledOnce();
  await userEvent.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalledTimes(2);
});

test('Escape is owned by time analysis before background panel handlers', () => {
  const backgroundEscape = vi.fn();
  const onClose = vi.fn();
  document.addEventListener('keydown', backgroundEscape);
  try {
    render(<TimeAnalysisPanel year={800} onYearChange={() => {}} annotationLayer="none" onAnnotationLayerChange={() => {}} onClose={onClose}/>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
    expect(backgroundEscape).not.toHaveBeenCalled();
  } finally {
    document.removeEventListener('keydown', backgroundEscape);
  }
});

test('reselecting the current range does not add a duplicate semantic view', async () => {
  const onViewWindowChange = vi.fn();
  const onSemanticViewChange = vi.fn();
  render(<TimeAnalysisPanel
    year={800}
    onYearChange={() => {}}
    annotationLayer="none"
    onAnnotationLayerChange={() => {}}
    onClose={() => {}}
    viewWindow={[-2070, 2026]}
    onViewWindowChange={onViewWindowChange}
    onSemanticViewChange={onSemanticViewChange}
  />);
  await userEvent.click(screen.getByRole('button', { name: '王朝至今' }));
  expect(onViewWindowChange).not.toHaveBeenCalled();
  expect(onSemanticViewChange).not.toHaveBeenCalled();
});

test.each(['wide', 'narrow', 'mobile', 'short'] as const)('marks the %s responsive presentation', (presentation) => {
  render(<TimeAnalysisPanel
    year={800}
    onYearChange={() => {}}
    annotationLayer="none"
    onAnnotationLayerChange={() => {}}
    onClose={() => {}}
    presentation={presentation}
  />);
  expect(screen.getByRole('region', { name: '时间分析' })).toHaveClass(`presentation-${presentation}`);
});

test('general analysis controls expose 44px touch targets without distorting proportional dynasty bands', () => {
  render(<TimeAnalysisPanel
    year={800}
    onYearChange={() => {}}
    annotationLayer="none"
    onAnnotationLayerChange={() => {}}
    onClose={() => {}}
  />);

  const targets = [
    screen.getByRole('button', { name: '全历史' }),
    screen.getByRole('combobox', { name: '选择朝代并放大时间轴' }),
    screen.getByRole('spinbutton', { name: '输入历史年份' }),
    screen.getByRole('button', { name: '前往' }),
    screen.getByRole('button', { name: '缩小时间轴' }),
    screen.getByRole('slider', { name: '选择历史年份' }),
  ];

  for (const target of targets) expect(getComputedStyle(target).minHeight).toBe('44px');
  expect(getComputedStyle(screen.getByRole('button', { name: /聚焦秦/ })).minHeight).not.toBe('44px');
});
