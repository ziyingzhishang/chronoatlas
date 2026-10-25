import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useLocale } from '../i18n/locale';
import { formatHistoricalYear } from '../domain/timeline';

interface EntityDrawerProps {
  title: string;
  entityType: 'polity' | 'place' | 'person' | 'event' | 'heritage';
  children: ReactNode;
  onClose: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  widthPercent?: number;
  onWidthChange?: (widthPercent: number) => void;
  mapYear?: number;
  singleView?: boolean;
}

const MIN_TOPIC_WIDTH = 34;
const MAX_TOPIC_WIDTH = 62;
const WIDTH_STEP = 2;

function clampWidth(width: number) {
  return Math.min(MAX_TOPIC_WIDTH, Math.max(MIN_TOPIC_WIDTH, Math.round(width)));
}

export function EntityDrawer({ title, entityType, children, onClose, onBack, canGoBack = false, widthPercent = 44, onWidthChange, mapYear, singleView = false }: EntityDrawerProps) {
  const { t } = useLocale();
  const closeButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const dragCleanup = useRef<(() => void) | undefined>();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) opener.current = active;
    closeButton.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (singleView && event.key === 'Tab' && drawer.current) {
        const focusable = [...drawer.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable.at(-1)!;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      dragCleanup.current?.();
      if (opener.current?.isConnected) opener.current.focus();
    };
  }, [singleView]);

  function updateWidth(nextWidth: number) {
    onWidthChange?.(clampWidth(nextWidth));
  }

  function handleSeparatorKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    let nextWidth: number | undefined;
    if (event.key === 'ArrowLeft') nextWidth = widthPercent + WIDTH_STEP;
    if (event.key === 'ArrowRight') nextWidth = widthPercent - WIDTH_STEP;
    if (event.key === 'Home') nextWidth = MIN_TOPIC_WIDTH;
    if (event.key === 'End') nextWidth = MAX_TOPIC_WIDTH;
    if (nextWidth === undefined) return;
    event.preventDefault();
    updateWidth(nextWidth);
  }

  function handleSeparatorPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!onWidthChange) return;
    event.preventDefault();
    const container = drawer.current?.parentElement?.getBoundingClientRect();
    if (!container?.width) return;
    const handleMove = (moveEvent: PointerEvent) => {
      updateWidth(((container.right - moveEvent.clientX) / container.width) * 100);
    };
    const stopDragging = () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', stopDragging);
      document.body.classList.remove('is-resizing-topic');
      dragCleanup.current = undefined;
    };
    dragCleanup.current?.();
    dragCleanup.current = stopDragging;
    document.body.classList.add('is-resizing-topic');
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', stopDragging);
  }

  return <>
    <button className="entity-drawer-backdrop" aria-label={t('关闭详情')} onClick={onClose} />
    <aside ref={drawer} className={`entity-drawer entity-drawer-${entityType}`} role="dialog" aria-modal={singleView || undefined} aria-label={t(title)} style={{ width: `${clampWidth(widthPercent)}%` }}>
      <div
        className="entity-drawer-resizer"
        role="separator"
        tabIndex={singleView ? -1 : 0}
        aria-label={t('调整地图与专题栏宽度')}
        aria-orientation="vertical"
        aria-valuemin={MIN_TOPIC_WIDTH}
        aria-valuemax={MAX_TOPIC_WIDTH}
        aria-valuenow={clampWidth(widthPercent)}
        onKeyDown={handleSeparatorKeyDown}
        onPointerDown={handleSeparatorPointerDown}
      />
      <header className="entity-drawer-heading">
        <div className="entity-drawer-heading-actions">
          {canGoBack && onBack && <button type="button" aria-label={t('返回上一个实体')} onClick={onBack}>‹</button>}
          <div className="entity-drawer-title"><h2>{t(title)}</h2>{mapYear !== undefined && <span>{t('地图时点：')}{t(formatHistoricalYear(mapYear))}</span>}</div>
        </div>
        <button ref={closeButton} type="button" aria-label={t('关闭详情')} onClick={onClose}>×</button>
      </header>
      <div className="entity-drawer-scroll">{children}</div>
    </aside>
  </>;
}
