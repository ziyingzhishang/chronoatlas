import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import type { HistoricalEvent } from '../domain/types';
import type { YearWindow } from '../domain/timeline';
import { DEFAULT_TIMELINE_WINDOW } from '../components/Timeline';
import { useLocale } from '../i18n/locale';
import { clampPosition, readPreference, type Point } from './layout';
import { TimeAnalysisPanel } from './TimeAnalysisPanel';
import { TimeExplorationBar } from './TimeExplorationBar';
import { initialTimeNavigationState, timeNavigationReducer, type TimelineAnnotationLayer } from './time-navigation-state';
import { usePaneSize } from './usePaneSize';

const storageKey = 'history-workspace-v1';

export interface TimeControllerProps {
  year: number;
  eraLabel?: string;
  viewWindow?: YearWindow;
  onYearChange: (year: number) => void;
  onYearCommit?: (year: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onEventSelect?: (event: HistoricalEvent) => void;
  onEventGroup?: (ids: string[]) => void;
  onViewWindowChange?: (window: YearWindow) => void;
  onSemanticViewChange?: (window: YearWindow, label: string) => void;
  viewLabel?: string;
  canGoBack?: boolean;
  onBackView?: () => void;
  onExclusiveAnalysisChange?: (active: boolean) => void;
  analysisOpen?: boolean;
  onAnalysisOpenChange?: (open: boolean) => void;
}

export function TimeController({
  year,
  eraLabel,
  viewWindow,
  onYearChange,
  onYearCommit,
  isPlaying,
  onPlayToggle,
  onEventSelect,
  onEventGroup,
  onViewWindowChange,
  onSemanticViewChange,
  viewLabel,
  canGoBack,
  onBackView,
  onExclusiveAnalysisChange,
  analysisOpen,
  onAnalysisOpenChange,
}: TimeControllerProps) {
  const { t } = useLocale();
  const [navigation, dispatch] = useReducer(timeNavigationReducer, initialTimeNavigationState);
  const [localViewWindow, setLocalViewWindow] = useState<YearWindow>(DEFAULT_TIMELINE_WINDOW);
  const activeViewWindow = viewWindow ?? localViewWindow;
  const [preference, setPreference] = useState(() => {
    try { return readPreference(localStorage.getItem(storageKey)); } catch { return readPreference(null); }
  });
  const root = useRef<HTMLDivElement | null>(null);
  const pane = useRef<HTMLElement | null>(null);
  const drag = useRef<{ pointer: number; start: Point; position: Point; latest: Point } | null>(null);
  const resizeDrag = useRef<{ pointer: number; startY: number; startHeight: number; bottomY?: number } | null>(null);
  const [analysisHeight, setAnalysisHeight] = useState(220);
  const paneSize = usePaneSize(pane);
  const navigationMode = analysisOpen === undefined ? navigation.mode : analysisOpen ? 'analysis' : 'bar';
  const supportsFloating = paneSize.presentation === 'wide';
  const floating = supportsFloating && preference.mode === 'floating';
  const exclusiveAnalysis = navigationMode === 'analysis' && paneSize.presentation === 'short';
  const minimumControllerHeight = 52;
  const maximumControllerHeight = Math.max(minimumControllerHeight, Math.min(paneSize.height - 24, paneSize.height * (paneSize.presentation === 'mobile' ? 0.42 : 0.65)));
  const visibleAnalysisHeight = Math.min(analysisHeight, maximumControllerHeight);

  const resizeController = (height: number, bottomY?: number) => {
    const anchoredBottom = bottomY === undefined ? undefined : Math.min(bottomY, paneSize.height - 64);
    const maxHeight = anchoredBottom === undefined ? maximumControllerHeight : Math.min(maximumControllerHeight, anchoredBottom - 64);
    const nextHeight = Math.round(Math.max(minimumControllerHeight, Math.min(height, maxHeight)));
    setAnalysisHeight(nextHeight);
    if (anchoredBottom !== undefined) {
      setPreference((previous) => ({ ...previous, position: { ...previous.position, y: anchoredBottom - nextHeight } }));
    }
    if (nextHeight > minimumControllerHeight && navigationMode !== 'analysis') openAnalysis();
    return nextHeight;
  };

  const setRoot = useCallback((node: HTMLDivElement | null) => {
    root.current = node;
    pane.current = node?.parentElement ?? null;
  }, []);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(preference)); } catch { /* Storage-disabled mode still works. */ }
  }, [preference]);

  useEffect(() => {
    onExclusiveAnalysisChange?.(exclusiveAnalysis);
  }, [exclusiveAnalysis, onExclusiveAnalysisChange]);

  useEffect(() => () => onExclusiveAnalysisChange?.(false), [onExclusiveAnalysisChange]);

  useLayoutEffect(() => {
    if (!floating || !root.current) return undefined;
    const constrain = () => {
      const rect = root.current?.getBoundingClientRect();
      if (!rect) return;
      const targetHeight = navigationMode === 'analysis' ? visibleAnalysisHeight : minimumControllerHeight;
      setPreference((previous) => {
        const position = clampPosition(previous.position, paneSize, { width: rect.width, height: targetHeight });
        return position.x === previous.position.x && position.y === previous.position.y
          ? previous
          : { ...previous, position };
      });
    };
    constrain();
    const observer = new ResizeObserver(constrain);
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [floating, navigationMode, paneSize.width, paneSize.height, visibleAnalysisHeight]);

  const move = (position: Point, snap = false) => {
    const rect = root.current?.getBoundingClientRect();
    if (!rect) return;
    const clamped = clampPosition(position, paneSize, rect);
    if (snap) {
      if (clamped.x < 36) clamped.x = 12;
      if (paneSize.width - rect.width - clamped.x < 36) clamped.x = Math.max(12, paneSize.width - rect.width - 12);
    }
    setPreference((previous) => ({ ...previous, position: clamped }));
  };

  const closeAnalysis = () => {
    dispatch({ type: 'close-analysis' });
    onAnalysisOpenChange?.(false);
    root.current?.querySelector<HTMLButtonElement>('.time-analysis-open')?.focus();
  };

  const openAnalysis = () => {
    dispatch({ type: 'open-analysis' });
    onAnalysisOpenChange?.(true);
  };

  const setAnnotationLayer = (layer: TimelineAnnotationLayer) => {
    dispatch({ type: layer === 'events' ? 'show-events' : layer === 'changes' ? 'show-changes' : 'show-none' });
  };

  const changeViewWindow = (next: YearWindow) => {
    if (viewWindow === undefined) setLocalViewWindow(next);
    onViewWindowChange?.(next);
  };

  const layoutTools = supportsFloating ? <div className="time-layout-tools" role="group" aria-label={t('布局')}>
    {floating && <button
      type="button"
      className="controller-grip"
      aria-label={t('移动时间控制器')}
      title={t('拖动移动；方向键微调')}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        drag.current = { pointer: event.pointerId, start: { x: event.clientX, y: event.clientY }, position: preference.position, latest: preference.position };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        const active = drag.current;
        if (!active || active.pointer !== event.pointerId) return;
        const next = { x: active.position.x + event.clientX - active.start.x, y: active.position.y + event.clientY - active.start.y };
        active.latest = next;
        move(next);
      }}
      onPointerUp={(event) => {
        const active = drag.current;
        if (!active || active.pointer !== event.pointerId) return;
        drag.current = null;
        move(active.latest, true);
      }}
      onPointerCancel={() => { drag.current = null; }}
      onKeyDown={(event) => {
        const delta: Record<string, Point> = { ArrowLeft: { x: -16, y: 0 }, ArrowRight: { x: 16, y: 0 }, ArrowUp: { x: 0, y: -16 }, ArrowDown: { x: 0, y: 16 } };
        const step = delta[event.key];
        if (!step) return;
        event.preventDefault();
        move({ x: preference.position.x + step.x, y: preference.position.y + step.y });
      }}
    >⠇</button>}
    <button type="button" aria-label={t(floating ? '停靠时间控制器' : '悬浮时间控制器')} onClick={() => setPreference((previous) => ({ ...previous, mode: floating ? 'docked' : 'floating' }))}>{t(floating ? '停靠' : '悬浮')}</button>
    {floating && <button type="button" onClick={() => move({ x: 24, y: 80 })}>{t('归位')}</button>}
  </div> : undefined;

  const resizeHandle = !exclusiveAnalysis && <div
    className="controller-resize-handle"
    role="separator"
    aria-orientation="horizontal"
    aria-label={t('调整时间控制器高度')}
    aria-valuemin={minimumControllerHeight}
    aria-valuemax={maximumControllerHeight}
    aria-valuenow={navigationMode === 'analysis' ? visibleAnalysisHeight : minimumControllerHeight}
    tabIndex={0}
    onPointerDown={(event) => {
      if (event.button !== 0) return;
      const startHeight = navigationMode === 'analysis' ? visibleAnalysisHeight : minimumControllerHeight;
      resizeDrag.current = {
        pointer: event.pointerId,
        startY: event.clientY,
        startHeight,
        ...(floating ? { bottomY: preference.position.y + startHeight } : {}),
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }}
    onPointerMove={(event) => {
      const active = resizeDrag.current;
      if (!active || active.pointer !== event.pointerId) return;
      resizeController(active.startHeight + active.startY - event.clientY, active.bottomY);
    }}
    onPointerUp={(event) => {
      const active = resizeDrag.current;
      if (!active || active.pointer !== event.pointerId) return;
      const nextHeight = resizeController(active.startHeight + active.startY - event.clientY, active.bottomY);
      resizeDrag.current = null;
      if (nextHeight === minimumControllerHeight && navigationMode === 'analysis') closeAnalysis();
    }}
    onPointerCancel={() => { resizeDrag.current = null; }}
    onKeyDown={(event) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      event.preventDefault();
      const height = navigationMode === 'analysis' ? visibleAnalysisHeight : minimumControllerHeight;
      const bottomY = floating ? preference.position.y + height : undefined;
      const nextHeight = resizeController(height + (event.key === 'ArrowUp' ? 24 : -24), bottomY);
      if (event.key === 'ArrowDown' && nextHeight === minimumControllerHeight && navigationMode === 'analysis') closeAnalysis();
    }}
  ><span aria-hidden="true" /></div>;

  return <div
    ref={setRoot}
    className={`time-controller is-${floating ? 'floating' : 'docked'} mode-${navigationMode} presentation-${paneSize.presentation}`}
    style={{
      ...(floating ? { left: preference.position.x, top: preference.position.y } : {}),
      ...(navigationMode === 'analysis' ? { height: visibleAnalysisHeight, '--time-controller-max-height': `${maximumControllerHeight}px` } : {}),
    } as React.CSSProperties}
  >
    {resizeHandle}
    <TimeExplorationBar
      year={year}
      eraLabel={eraLabel}
      viewWindow={activeViewWindow}
      isPlaying={isPlaying}
      presentation={paneSize.presentation}
      analysisOpen={navigationMode === 'analysis'}
      onYearChange={onYearChange}
      onYearCommit={onYearCommit ?? onYearChange}
      onPlayToggle={onPlayToggle}
      onOpenAnalysis={openAnalysis}
    />
    {navigationMode === 'analysis' && <TimeAnalysisPanel
      year={year}
      onYearChange={onYearChange}
      onYearCommit={onYearCommit}
      annotationLayer={navigation.annotationLayer}
      onAnnotationLayerChange={setAnnotationLayer}
      onClose={closeAnalysis}
      onEventSelect={onEventSelect}
      onEventGroup={onEventGroup}
      viewWindow={activeViewWindow}
      onViewWindowChange={changeViewWindow}
      onSemanticViewChange={onSemanticViewChange}
      viewLabel={viewLabel}
      canGoBack={canGoBack}
      onBackView={onBackView}
      advancedTools={layoutTools}
      presentation={paneSize.presentation}
    />}
  </div>;
}
