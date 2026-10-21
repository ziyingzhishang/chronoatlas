import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EntityDrawer } from './EntityDrawer';

describe('EntityDrawer', () => {
  it('renders a wide detail dialog and closes with Escape', () => {
    const onClose = vi.fn();
    render(<EntityDrawer title="人物详情" entityType="person" onClose={onClose}><p>人物内容</p></EntityDrawer>);

    expect(screen.getByRole('dialog', { name: '人物详情' })).toHaveClass('entity-drawer');
    expect(screen.getByText('人物内容')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('exposes a back action when navigation history exists', () => {
    const onBack = vi.fn();
    render(<EntityDrawer title="事件详情" entityType="event" onClose={vi.fn()} onBack={onBack} canGoBack><p>事件内容</p></EntityDrawer>);

    fireEvent.click(screen.getByRole('button', { name: '返回上一个实体' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
