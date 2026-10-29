import { useLayoutEffect, useMemo, useState, type RefObject } from 'react';
import { presentationForPane, type PanePresentation } from './layout';

export interface PaneSize {
  width: number;
  height: number;
  presentation: PanePresentation;
}

interface Dimensions {
  width: number;
  height: number;
}

const emptySize: Dimensions = { width: 0, height: 0 };

export function usePaneSize(ref: RefObject<HTMLElement | null>): PaneSize {
  const [size, setSize] = useState<Dimensions>(emptySize);

  useLayoutEffect(() => {
    const pane = ref.current;
    if (!pane) return undefined;

    const measure = () => {
      const rect = pane.getBoundingClientRect();
      const width = Math.max(0, rect.width);
      const height = Math.max(0, rect.height);
      setSize((previous) => previous.width === width && previous.height === height
        ? previous
        : { width, height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [ref]);

  return useMemo(() => ({
    ...size,
    presentation: presentationForPane(size.width, size.height),
  }), [size]);
}
