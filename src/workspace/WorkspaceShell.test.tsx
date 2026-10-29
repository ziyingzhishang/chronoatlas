import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { topicWidthBounds, WorkspaceShell } from './WorkspaceShell';
import '../styles/workspace.css';

function Demo({ singleView = false }: { singleView?: boolean }) {
  const [width, setWidth] = useState(44);
  return <WorkspaceShell
    topicWidthPercent={width}
    onTopicWidthChange={setWidth}
    singleTopicView={singleView}
    mapPane={<><div>地图</div><div data-testid="timeline">时间轴</div></>}
    topicPane={<aside aria-label="专题">专题内容</aside>}
  />;
}

function ExclusiveTimeDemo() {
  const [exclusive, setExclusive] = useState(false);
  const [mapState, setMapState] = useState(0);
  return <WorkspaceShell
    topicWidthPercent={44}
    onTopicWidthChange={() => {}}
    singleTopicView={false}
    exclusiveTimeAnalysis={exclusive}
    mapPane={<button type="button" onClick={() => setMapState((value) => value + 1)}>地图状态 {mapState}</button>}
    timeNavigationPane={<div data-testid="time-navigation"><button type="button" onClick={() => setExclusive((value) => !value)}>{exclusive ? '关闭时间分析' : '打开时间轴'}</button></div>}
    topicPane={<aside aria-label="专题"><input aria-label="专题笔记" defaultValue="保留的内容"/></aside>}
  />;
}

describe('WorkspaceShell', () => {
  it('preserves both pixel minimums at the 1024px split-view threshold', () => {
    expect(topicWidthBounds(1024)).toEqual({ min: 41.02, max: 45.31 });
    expect(topicWidthBounds(1440)).toEqual({ min: 34, max: 61.11 });
    expect(topicWidthBounds(1600)).toEqual({ min: 34, max: 62 });
  });

  it('keeps the map and timeline together beside the topic pane', () => {
    render(<Demo />);

    const mapPane = screen.getByRole('region', { name: '地图工作区' });
    const topicPane = screen.getByRole('complementary', { name: '专题' });
    expect(mapPane).toContainElement(screen.getByTestId('timeline'));
    expect(mapPane.parentElement).toBe(topicPane.parentElement);
    expect(topicPane).toHaveStyle({ width: '44%' });
    expect(screen.queryByRole('button', { name: '关闭详情' })).not.toBeInTheDocument();
  });

  it('owns keyboard resizing for the two sibling panes', () => {
    render(<Demo />);
    const divider = screen.getByRole('separator', { name: '调整地图与专题栏宽度' });

    fireEvent.keyDown(divider, { key: 'ArrowLeft' });
    expect(divider).toHaveAttribute('aria-valuenow', '46');
    expect(screen.getByRole('complementary', { name: '专题' })).toHaveStyle({ width: '46%' });
  });

  it('uses one main view without a divider on constrained screens', () => {
    render(<Demo singleView />);
    expect(screen.getByText('地图').closest('section')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('separator', { name: '调整地图与专题栏宽度' })).not.toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: '专题' })).toHaveStyle({ width: '100%' });
  });

  it('keeps time navigation inside the map pane beside a topic', () => {
    render(<WorkspaceShell
      topicWidthPercent={44}
      onTopicWidthChange={() => {}}
      singleTopicView={false}
      mapPane={<div>地图</div>}
      timeNavigationPane={<div data-testid="time-navigation">时间分析</div>}
      topicPane={<aside aria-label="专题">专题内容</aside>}
    />);
    const mapPane = screen.getByRole('region', { name: '地图工作区' });
    expect(mapPane).toContainElement(screen.getByTestId('time-navigation'));
    expect(screen.getByRole('complementary', { name: '专题' })).not.toContainElement(screen.getByTestId('time-navigation'));
  });

  it('makes only the short-screen background inert and restores the exact workspace state', () => {
    render(<ExclusiveTimeDemo/>);
    const mapPane = screen.getByRole('region', { name: '地图工作区' });
    fireEvent.click(screen.getByRole('button', { name: '打开时间轴' }));

    expect(mapPane).toHaveClass('time-analysis-exclusive');
    expect(getComputedStyle(mapPane).minWidth).toBe('0');
    expect(mapPane.querySelector('.workspace-map-content')).toHaveAttribute('inert');
    expect(mapPane.querySelector('.workspace-map-content')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('button', { name: /地图状态/ })).not.toBeInTheDocument();
    expect(screen.getByTestId('time-navigation')).not.toHaveAttribute('inert');
    expect(screen.queryByRole('complementary', { name: '专题' })).not.toBeInTheDocument();
    expect(document.querySelector('aside[aria-label="专题"]')).toHaveAttribute('hidden');
    expect(document.querySelector('aside[aria-label="专题"]')).toHaveAttribute('inert');
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();

    fireEvent.click(within(screen.getByTestId('time-navigation')).getByRole('button', { name: '关闭时间分析' }));
    expect(mapPane).not.toHaveClass('time-analysis-exclusive');
    expect(mapPane.querySelector('.workspace-map-content')).not.toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: '地图状态 0' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: '专题' })).toBeInTheDocument();
    expect(mapPane.parentElement).toBe(screen.getByRole('complementary', { name: '专题' }).parentElement);
    expect(screen.getByRole('textbox', { name: '专题笔记' })).toHaveValue('保留的内容');
  });
});
