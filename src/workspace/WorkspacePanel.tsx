import { useLocale } from '../i18n/locale';
import { useEffect, useRef, type ReactNode } from 'react';

export type PanelName = 'layers'|'events'|'details'|'more';
export function WorkspacePanel({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}) {
  const { t } = useLocale();
  const close = useRef<HTMLButtonElement>(null);
  const opener=useRef<HTMLElement|null>(null);
  const onCloseRef=useRef(onClose);onCloseRef.current=onClose;
  useEffect(()=>{
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onCloseRef.current();}};
    document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('keydown',escape);if(opener.current?.isConnected)opener.current.focus();};
  },[]);
  useEffect(()=>{
    const active=document.activeElement;
    if(active instanceof HTMLElement && !close.current?.closest('.workspace-panel')?.contains(active))opener.current=active;
    close.current?.focus();
  },[title]);
  return <section className="workspace-panel" id="workspace-panel" aria-label={t(title)}>
    <div className="workspace-panel-heading"><h2>{t(title)}</h2><button ref={close} aria-label={t("关闭面板")} onClick={onClose}>{t("关闭 ×")}</button></div>
    <div className="workspace-panel-scroll">{children}</div>
  </section>;
}
