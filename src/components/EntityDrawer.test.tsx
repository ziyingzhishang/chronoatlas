import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EntityDrawer } from './EntityDrawer';
import { useState } from 'react';

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

  it('exposes a keyboard-resizable topic split', () => {
    const onWidthChange = vi.fn();
    render(
      <EntityDrawer
        title="城市专题"
        entityType="place"
        widthPercent={44}
        onWidthChange={onWidthChange}
        onClose={vi.fn()}
      >
        <p>城市内容</p>
      </EntityDrawer>,
    );

    const separator = screen.getByRole('separator', { name: '调整地图与专题栏宽度' });
    expect(separator).toHaveAttribute('aria-valuenow', '44');
    fireEvent.keyDown(separator, { key: 'ArrowLeft' });
    expect(onWidthChange).toHaveBeenCalledWith(46);
  });

  it('resizes the topic split with a pointer drag', () => {
    const widths: number[] = [];
    function StatefulDrawer() {
      const [width, setWidth] = useState(44);
      return <EntityDrawer title="事件专题" entityType="event" widthPercent={width} onWidthChange={(next) => { widths.push(next); setWidth(next); }} onClose={() => {}}><p>事件内容</p></EntityDrawer>;
    }
    render(<StatefulDrawer />);
    const separator = screen.getByRole('separator', { name: '调整地图与专题栏宽度' });
    const container = screen.getByRole('dialog', { name: '事件专题' }).parentElement!;
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, left: 0, top: 0, right: 1000, bottom: 700, width: 1000, height: 700, toJSON: () => ({}) });

    fireEvent.pointerDown(separator, { clientX: 560 });
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 500 }));
    document.dispatchEvent(new MouseEvent('pointermove', { clientX: 420 }));
    fireEvent.pointerUp(document);

    expect(widths).toEqual([50, 58]);
    expect(document.body).not.toHaveClass('is-resizing-topic');
  });

  it('keeps keyboard focus across repeated resizing and follows range conventions', () => {
    function StatefulDrawer() {
      const [width, setWidth] = useState(44);
      return <EntityDrawer title="城市专题" entityType="place" widthPercent={width} onWidthChange={setWidth} onClose={() => {}}><p>城市内容</p></EntityDrawer>;
    }
    render(<StatefulDrawer />);
    const separator = screen.getByRole('separator', { name: '调整地图与专题栏宽度' });
    separator.focus();
    fireEvent.keyDown(separator, { key: 'ArrowLeft' });
    fireEvent.keyDown(separator, { key: 'ArrowLeft' });
    expect(separator).toHaveFocus();
    expect(separator).toHaveAttribute('aria-valuenow', '48');
    fireEvent.keyDown(separator, { key: 'Home' });
    expect(separator).toHaveAttribute('aria-valuenow', '34');
    fireEvent.keyDown(separator, { key: 'End' });
    expect(separator).toHaveAttribute('aria-valuenow', '62');
  });

  it('uses modal semantics and traps focus in single-view mode', () => {
    render(<EntityDrawer title="人物专题" entityType="person" singleView onClose={() => {}}><button>末尾操作</button></EntityDrawer>);
    const dialog = screen.getByRole('dialog', { name: '人物专题' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const close = within(dialog).getByRole('button', { name: '关闭详情' });
    const last = screen.getByRole('button', { name: '末尾操作' });
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(close).toHaveFocus();
  });
});
