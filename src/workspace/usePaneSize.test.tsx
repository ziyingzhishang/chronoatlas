import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { usePaneSize } from './usePaneSize';

let observedResize: ResizeObserverCallback | undefined;
let paneRect = { width: 900, height: 800 };

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const size = usePaneSize(ref);
  return <div ref={ref} data-testid="pane">{size.width}×{size.height}:{size.presentation}</div>;
}

beforeEach(() => {
  paneRect = { width: 900, height: 800 };
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
    ...paneRect,
    x: 0,
    y: 0,
    top: 0,
    right: paneRect.width,
    bottom: paneRect.height,
    left: 0,
    toJSON: () => ({}),
  }));
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: ResizeObserverCallback) { observedResize = callback; }
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  observedResize = undefined;
});

test('uses the synchronous pane rectangle for its initial presentation', () => {
  render(<Probe/>);
  expect(screen.getByTestId('pane')).toHaveTextContent('900×800:wide');
});

test('responds to pane-only resizing without reading window dimensions', () => {
  const originalWindowWidth = window.innerWidth;
  render(<Probe/>);

  paneRect = { width: 560, height: 800 };
  act(() => observedResize?.([], {} as ResizeObserver));

  expect(window.innerWidth).toBe(originalWindowWidth);
  expect(screen.getByTestId('pane')).toHaveTextContent('560×800:narrow');
});

test('classifies a portrait tablet pane as narrow even above the desktop width threshold', () => {
  paneRect = { width: 809, height: 934 };
  render(<Probe/>);
  expect(screen.getByTestId('pane')).toHaveTextContent('809×934:narrow');
});
