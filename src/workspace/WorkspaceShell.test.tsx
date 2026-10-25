import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { WorkspaceShell } from './WorkspaceShell';

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

describe('WorkspaceShell', () => {
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
});
