import { useEffect, useRef, type ReactNode } from 'react';
import { useLocale } from '../i18n/locale';

interface EntityDrawerProps {
  title: string;
  entityType: 'polity' | 'place' | 'person' | 'event' | 'heritage';
  children: ReactNode;
  onClose: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

export function EntityDrawer({ title, entityType, children, onClose, onBack, canGoBack = false }: EntityDrawerProps) {
  const { t } = useLocale();
  const closeButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) opener.current = active;
    closeButton.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(drawer.current?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])') ?? []).filter((element) => !element.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (opener.current?.isConnected) opener.current.focus();
    };
  }, [onClose]);

  return <>
    <button className="entity-drawer-backdrop" aria-label={t('关闭详情')} onClick={onClose} />
    <aside ref={drawer} className={`entity-drawer entity-drawer-${entityType}`} role="dialog" aria-modal="true" aria-label={t(title)}>
      <header className="entity-drawer-heading">
        <div className="entity-drawer-heading-actions">
          {canGoBack && onBack && <button type="button" aria-label={t('返回上一个实体')} onClick={onBack}>‹</button>}
          <h2>{t(title)}</h2>
        </div>
        <button ref={closeButton} type="button" aria-label={t('关闭详情')} onClick={onClose}>×</button>
      </header>
      <div className="entity-drawer-scroll">{children}</div>
    </aside>
  </>;
}
