import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CityHistoryTimeline } from './CityHistoryTimeline';
import type { CityHistoryTimelineNode } from '../domain/city-timeline';

const nodes: CityHistoryTimelineNode[] = [
  { id: 'event-1', year: 634, label: '大明宫营建', type: 'event', entity: { type: 'event', id: 'event-1' } },
  { id: 'person-1', year: 598, label: '李世民', type: 'person', entity: { type: 'person', id: 'person-1' } },
  { id: 'heritage-1', year: 634, label: '大明宫遗址', type: 'heritage', entity: { type: 'heritage', id: 'heritage-1' } },
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
});
