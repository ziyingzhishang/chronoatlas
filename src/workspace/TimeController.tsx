import { useLocale } from '../i18n/locale';
import { Timeline } from '../components/Timeline';
import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import { clampPosition, layoutFor, readPreference, type Point } from './layout';
import { CollapsedTimeControls } from './CollapsedTimeControls';

const storageKey = 'history-workspace-v1';
type TimeControllerProps = ComponentProps<typeof Timeline> & { eraLabel?: string };

export function TimeController({ eraLabel, ...timelineProps }: TimeControllerProps) {
  const { t } = useLocale();
  const [viewport, setViewport] = useState(() => ({width:window.innerWidth,height:window.innerHeight}));
  const [bounds, setBounds] = useState(() => ({width:window.innerWidth,height:window.innerHeight}));
  const [preference, setPreference] = useState(() => {
    try { return readPreference(localStorage.getItem(storageKey)); } catch { return readPreference(null); }
  });
  const [density, setDensity] = useState<'collapsed'|'compact'|'expanded'>('collapsed');
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{pointer:number;start:Point;position:Point}|null>(null);
  const {mobile,short} = layoutFor(viewport.width, viewport.height);
  const floating = !mobile && preference.mode === 'floating';
  const effectiveDensity = short && density === 'compact' ? 'collapsed' : density;

  useLayoutEffect(() => {
    const container = box.current?.parentElement;
    const resize = () => {
      setViewport(previous => previous.width === window.innerWidth && previous.height === window.innerHeight ? previous : { width: window.innerWidth, height: window.innerHeight });
      const rect = container?.getBoundingClientRect();
      const next = rect?.width && rect.height ? { width: rect.width, height: rect.height } : { width: window.innerWidth, height: window.innerHeight };
      setBounds(previous => previous.width === next.width && previous.height === next.height ? previous : next);
    };
    resize();
    window.addEventListener('resize',resize);
    if (!container) return () => window.removeEventListener('resize',resize);
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => { observer.disconnect(); window.removeEventListener('resize',resize); };
  },[]);
  useEffect(() => {
    try { localStorage.setItem(storageKey,JSON.stringify(preference)); } catch { /* Private/storage-disabled mode still works. */ }
  },[preference]);
  useLayoutEffect(() => {
    if (!floating || !box.current) return;
    const constrain = () => {
      const rect = box.current?.getBoundingClientRect();
      if (!rect) return;
      setPreference(previous => {
        const position = clampPosition(previous.position,bounds,rect);
        return position.x === previous.position.x && position.y === previous.position.y ? previous : {...previous,position};
      });
    };
    constrain();
    const observer = new ResizeObserver(constrain);
    observer.observe(box.current);
    return () => observer.disconnect();
  },[floating,bounds,density]);

  function move(position:Point, snap = false) {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    const clamped = clampPosition(position,bounds,rect);
    if (snap) {
      if (clamped.x < 36) clamped.x = 12;
      if (bounds.width - rect.width - clamped.x < 36) clamped.x = Math.max(12,bounds.width-rect.width-12);
    }
    setPreference(previous=>({...previous,position:clamped}));
  }

  const mode = timelineProps.mode ?? 'explore';
  return <div className={`time-controller ${floating?'is-floating':'is-docked'} mode-${mode}`} data-density={effectiveDensity}
    ref={box} style={floating?{left:preference.position.x,top:preference.position.y}:undefined}>
    <div className="controller-handlebar">
      <button className="controller-grip" aria-label={t(floating?'移动时间控制器':'切换时间控制器密度')} title={t(floating?'拖动移动；方向键微调':'点击展开或收起')}
        onClick={()=>{if(!floating)setDensity(d=>d==='expanded'?'compact':'expanded');}}
        onPointerDown={e=>{
          if(!floating || e.button!==0)return;
          drag.current={pointer:e.pointerId,start:{x:e.clientX,y:e.clientY},position:preference.position};
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e=>{const d=drag.current;if(d?.pointer===e.pointerId)move({x:d.position.x+e.clientX-d.start.x,y:d.position.y+e.clientY-d.start.y});}}
        onPointerUp={e=>{if(drag.current?.pointer===e.pointerId){drag.current=null;move(preference.position,true);}}}
        onPointerCancel={()=>{drag.current=null;}}
        onKeyDown={e=>{
          if(!floating)return;
          const delta:Record<string,Point>={ArrowLeft:{x:-16,y:0},ArrowRight:{x:16,y:0},ArrowUp:{x:0,y:-16},ArrowDown:{x:0,y:16}};
          if(delta[e.key]){e.preventDefault();move({x:preference.position.x+delta[e.key].x,y:preference.position.y+delta[e.key].y});}
      }}><span aria-hidden="true">⠿</span><span className="controller-title">{t("时间导航")}</span></button>
      {effectiveDensity === 'collapsed' && <CollapsedTimeControls year={timelineProps.year} eraLabel={eraLabel}
        isPlaying={timelineProps.isPlaying} onYearChange={timelineProps.onYearChange} onPlayToggle={timelineProps.onPlayToggle} />}
      <div className="controller-layout-actions">
        {!mobile && <button aria-label={t(floating?'停靠时间控制器':'悬浮时间控制器')} onClick={()=>setPreference(p=>({...p,mode:floating?'docked':'floating'}))}>{t(floating?'停靠':'悬浮')}</button>}
        {floating && <button onClick={()=>move({x:24,y:80})}>{t("归位")}</button>}
        {effectiveDensity!=='collapsed' && <button aria-label={t("收起时间控制器")} onClick={()=>setDensity('collapsed')}>{t("收起")}</button>}
        {effectiveDensity==='collapsed' && <button aria-label={t("紧凑时间控制器")} onClick={()=>setDensity(short?'expanded':'compact')}>{t("刻度")}</button>}
        {!(mobile && effectiveDensity === 'collapsed') && <button aria-label={t(density==='expanded'?'精简时间控制器':'展开时间控制器')} aria-expanded={density==='expanded'} aria-controls="time-controller-content"
          onClick={()=>setDensity(d=>d==='expanded'?'compact':'expanded')}>{t(density==='expanded'?'精简':'展开')}</button>}
      </div>
    </div>
    {effectiveDensity !== 'collapsed' && <div id="time-controller-content" className="controller-content"><Timeline {...timelineProps} density={effectiveDensity}/></div>}
  </div>;
}
