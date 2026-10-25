import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useLocale } from '../i18n/locale';
import { formatHistoricalYear } from '../domain/timeline';

interface EntityDrawerProps {
  title: string;
  entityType: 'polity' | 'place' | 'person' | 'event' | 'heritage';
  children: ReactNode;
  onClose: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  mapYear?: number;
  singleView?: boolean;
  style?: CSSProperties;
}

export function EntityDrawer({ title, entityType, children, onClose, onBack, canGoBack = false, mapYear, singleView = false, style }: EntityDrawerProps) {
  const { t } = useLocale();
  const closeButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
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
      if (opener.current?.isConnected) opener.current.focus();
    };
  }, [singleView]);

  return <aside ref={drawer} className={`entity-drawer entity-drawer-${entityType}`} role="dialog" aria-modal={singleView || undefined} aria-label={t(title)} style={style}>
      <header className="entity-drawer-heading">
        <div className="entity-drawer-heading-actions">
          {canGoBack && onBack && <button type="button" aria-label={t('返回上一个实体')} onClick={onBack}>‹</button>}
          <div className="entity-drawer-title"><h2>{t(title)}</h2>{mapYear !== undefined && <span>{t('地图时点：')}{t(formatHistoricalYear(mapYear))}</span>}</div>
        </div>
        <button ref={closeButton} type="button" aria-label={t('关闭详情')} onClick={onClose}>×</button>
      </header>
      <div className="entity-drawer-scroll">{children}</div>
    </aside>;
}
