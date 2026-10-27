import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import type { TimelineAnnotationLayer } from './time-navigation-state';
import { TimeExplorationBar } from './TimeExplorationBar';
import { TimeAnalysisPanel } from './TimeAnalysisPanel';

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
