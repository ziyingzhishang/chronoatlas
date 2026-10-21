import { useLocale } from '../i18n/locale';
import { useEffect, useRef, type ReactNode } from 'react';

export type PanelName = 'layers'|'events'|'details'|'more';
export function WorkspacePanel({title,onClose,children,variant='panel'}:{title:string;onClose:()=>void;children:ReactNode;variant?:'panel'|'hud'}) {
  const { t } = useLocale();
  const close = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const opener=useRef<HTMLElement|null>(null);
  const onCloseRef=useRef(onClose);onCloseRef.current=onClose;
  useEffect(()=>{
    const escape=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();onCloseRef.current();return;}
      if(e.key!=='Tab')return;
      const focusable=Array.from(panel.current?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')??[]).filter(el=>!el.hasAttribute('disabled'));
      if(!focusable.length)return;
      const first=focusable[0], last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('keydown',escape);if(opener.current?.isConnected)opener.current.focus();};
  },[]);
  useEffect(()=>{
    const active=document.activeElement;
    if(active instanceof HTMLElement && !close.current?.closest('.workspace-panel')?.contains(active))opener.current=active;
    close.current?.focus();
  },[title]);
  return <>{variant==='panel'&&<button className="workspace-panel-backdrop" aria-label={t("关闭面板")} onClick={onClose} />}<section ref={panel} className={`workspace-panel${variant==='hud'?' workspace-hud':''}`} id="workspace-panel" role="dialog" aria-modal="true" aria-label={t(title)}>
    <div className="workspace-panel-heading"><h2>{t(title)}</h2><button ref={close} aria-label={t("关闭面板")} onClick={onClose}>{t("关闭 ×")}</button></div>
    <div className="workspace-panel-scroll">{children}</div>
  </section></>;
}
