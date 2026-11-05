import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CityHistoryTimeline } from './CityHistoryTimeline';
import type { CityHistoryTimelineNode } from '../domain/city-timeline';
import '../styles/theme.css';

const nodes: CityHistoryTimelineNode[] = [
  { id: 'event-1', year: 634, label: '大明宫营建', type: 'event', entity: { type: 'event', id: 'event-1' }, evidence: { relationCount: 1, sourceStatus: 'available', sourceCount: 1, datePrecisions: ['range'], uncertaintyStatus: 'recorded', uncertaintyNotes: ['营建年代仍需结合阶段证据。'] } },
  { id: 'person-1', year: 598, label: '李世民', type: 'person', entity: { type: 'person', id: 'person-1' }, evidence: { relationCount: 0, sourceStatus: 'unresolved', sourceCount: 0, datePrecisions: [], uncertaintyStatus: 'not-recorded', uncertaintyNotes: [] } },
  { id: 'heritage-1', year: 634, label: '大明宫遗址', type: 'heritage', entity: { type: 'heritage', id: 'heritage-1' }, evidence: { relationCount: 0, sourceStatus: 'unresolved', sourceCount: 0, datePrecisions: [], uncertaintyStatus: 'not-recorded', uncertaintyNotes: [] } },
];

describe('CityHistoryTimeline', () => {
  it('opens a clicked node through the DetailEntity callback', () => {
    const onOpenEntity = vi.fn();
    render(<CityHistoryTimeline nodes={nodes} onOpenEntity={onOpenEntity} />);

    fireEvent.click(screen.getByRole('button', { name: '大明宫营建' }));

    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'event', id: 'event-1' });
  });

  it('filters nodes by entity type and keeps missing-data messages visible', () => {
    render(<CityHistoryTimeline nodes={nodes} missingData={['暂无已收录人物']} onOpenEntity={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '事件' }));

    expect(screen.getByRole('button', { name: '大明宫营建' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '李世民' })).not.toBeInTheDocument();
    expect(screen.getByText('暂无已收录人物')).toBeInTheDocument();
  });

  it('keeps city timeline filters and dates legible and touchable', () => {
    render(<CityHistoryTimeline nodes={nodes} onOpenEntity={vi.fn()} />);
    expect(getComputedStyle(screen.getByRole('button', { name: '人物' })).minHeight).toBe('44px');
    expect(getComputedStyle(screen.getAllByText('634年')[0]).fontSize).toBe('12px');
  });

  it('shows reader-facing material notes without evidence workflow status', () => {
    render(<CityHistoryTimeline nodes={nodes} onOpenEntity={vi.fn()} />);

    expect(document.body).not.toHaveTextContent('来源：可用');
    expect(document.body).not.toHaveTextContent('来源：待解析');
    expect(document.body).not.toHaveTextContent('时间精度：');

    const disclosure = screen.getAllByText('资料说明')[0];
    expect(disclosure.tagName).toBe('SUMMARY');
    disclosure.focus();
    fireEvent.click(disclosure);

    expect(screen.getByText('营建年代仍需结合阶段证据。')).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('关系数量');
  });

  it('does not offer an empty evidence disclosure when no source or uncertainty note exists', () => {
    render(<CityHistoryTimeline nodes={[nodes[1]]} onOpenEntity={vi.fn()} />);
    expect(screen.queryByText('资料说明')).not.toBeInTheDocument();
  });

  it('keeps the node entity button as the drawer navigation target', () => {
    const onOpenEntity = vi.fn();
    render(<CityHistoryTimeline nodes={nodes} onOpenEntity={onOpenEntity} />);

    fireEvent.click(screen.getByRole('button', { name: /^大明宫营建$/ }));

    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'event', id: 'event-1' });
  });
});
