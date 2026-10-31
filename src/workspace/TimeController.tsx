import { useLocale } from '../i18n/locale';
import { Timeline } from '../components/Timeline';
import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import { clampPanelHeight, clampPosition, defaultFloatingPosition, layoutFor, readPreference, type Point } from './layout';
import { CollapsedTimeControls } from './CollapsedTimeControls';

const storageKey = 'history-workspace-v1';
type TimeControllerProps = ComponentProps<typeof Timeline> & {
  onResizeInteractionChange?: (active:boolean)=>void;
};

export function TimeController({ onResizeInteractionChange, ...timelineProps }: TimeControllerProps) {
  const { t } = useLocale();
  const [viewport, setViewport] = useState(() => ({width:window.innerWidth,height:window.innerHeight}));
  const [bounds, setBounds] = useState(() => ({width:window.innerWidth,height:window.innerHeight}));
  const [preference, setPreference] = useState(() => {
    try { return readPreference(localStorage.getItem(storageKey)); } catch { return readPreference(null); }
  });
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{pointer:number;start:Point;position:Point}|null>(null);
  const resizeDrag = useRef<{pointer:number;startY:number;height:number;bottomY?:number}|null>(null);
  const resizeFrame = useRef<number|null>(null);
  const [panelHeight, setPanelHeight] = useState<number>(() => preference.panelHeight ?? 50);
  const [resizeActive,setResizeActive]=useState(false);
  const [measuredPanelMax,setMeasuredPanelMax]=useState<number>();
  const [rangeControlsTarget,setRangeControlsTarget]=useState<HTMLDivElement|null>(null);
  const {mobile,short} = layoutFor(viewport.width, viewport.height);
  const floating = !mobile && preference.mode === 'floating';
  const effectiveDensity = panelHeight <= 56 ? 'collapsed' : panelHeight < 220 ? 'compact' : 'expanded';
  const adjustable = true;

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
    box.current?.querySelector<HTMLElement>('.controller-content')?.toggleAttribute('inert', panelHeight <= 50);
  },[panelHeight]);
  useLayoutEffect(() => {
    if (!floating || !box.current) return;
    const constrain = () => {
      const rect = box.current?.getBoundingClientRect();
      if (!rect) return;
      const size = {width:rect.width || Math.min(760,Math.max(0,bounds.width-24)),height:panelHeight};
      setPreference(previous => {
        const initialPosition = previous.position.x === 24 && previous.position.y === 80
          ? defaultFloatingPosition(bounds,size) : previous.position;
        const position = clampPosition(initialPosition,bounds,size);
        return position.x === previous.position.x && position.y === previous.position.y ? previous : {...previous,position};
      });
    };
    constrain();
    const observer = new ResizeObserver(constrain);
    observer.observe(box.current);
    return () => observer.disconnect();
  },[floating,bounds,panelHeight]);
  useLayoutEffect(() => {
    if (!adjustable || !box.current) return;
    const controller = box.current;
    const content = controller.querySelector<HTMLElement>('.controller-content');
    const naturalContent = content?.firstElementChild as HTMLElement|null|undefined;
    const constrain = () => {
      const natural = naturalPanelHeight(content, controller.querySelector<HTMLElement>('.controller-handlebar'));
      setMeasuredPanelMax(clampPanelHeight(Number.POSITIVE_INFINITY,natural,viewport.height,mobile||short));
      const next = clampPanelHeight(panelHeight, natural, viewport.height, mobile || short);
      if (next !== panelHeight) {
        setPanelHeight(next);
        setPreference(previous => ({...previous,panelHeight:next}));
      }
    };
    constrain();
    const observer = new ResizeObserver(constrain);
    observer.observe(controller);
    if (content) observer.observe(content);
    if (naturalContent) observer.observe(naturalContent);
    return () => observer.disconnect();
  },[adjustable,bounds,mobile,panelHeight,short,viewport.height]);

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

  function toggleFloating() {
    if (floating) {
      setPreference(previous=>({...previous,mode:'docked'}));
      return;
    }
    const size = {width:Math.min(760,Math.max(0,bounds.width-24)),height:panelHeight};
    setPreference(previous=>({
      ...previous,
      mode:'floating',
      position:previous.position.x === 24 && previous.position.y === 80
        ? defaultFloatingPosition(bounds,size) : previous.position
    }));
  }

  function resetFloatingPosition() {
    const rect = box.current?.getBoundingClientRect();
    const size = {width:rect?.width || Math.min(760,Math.max(0,bounds.width-24)),height:rect?.height || panelHeight};
    move(defaultFloatingPosition(bounds,size));
  }

  function toggleDensity() {
    if (effectiveDensity === 'collapsed') {
      resize(naturalPanelHeight(box.current?.querySelector<HTMLElement>('.controller-content'),box.current?.querySelector<HTMLElement>('.controller-handlebar')));
      return;
    }
    resize(50);
    if (floating) {
      const rect = box.current?.getBoundingClientRect();
      const size = {width:rect?.width || Math.min(760,Math.max(0,bounds.width-24)),height:50};
      setPreference(previous=>({...previous,position:defaultFloatingPosition(bounds,size)}));
    }
  }

  function resize(height:number, persist=true, anchoredBottomY?:number) {
    const content = box.current?.querySelector<HTMLElement>('.controller-content');
    const header = box.current?.querySelector<HTMLElement>('.controller-handlebar');
    const natural = naturalPanelHeight(content,header);
    const clampedHeight = clampPanelHeight(height, natural, viewport.height, mobile || short);
    const next = floating && anchoredBottomY !== undefined
      ? Math.min(clampedHeight, Math.max(50, anchoredBottomY - 64))
      : clampedHeight;
    setPanelHeight(next);
    if (persist || (floating && anchoredBottomY !== undefined)) {
      setPreference(previous => ({
        ...previous,
        ...(persist ? {panelHeight:next} : {}),
        ...(floating && anchoredBottomY !== undefined
          ? {position:{...previous.position,y:anchoredBottomY-next}}
          : {})
      }));
    }
    return next;
  }
  function naturalPanelHeight(content?:HTMLElement|null, header?:HTMLElement|null) {
    return Math.max(180,(content?.scrollHeight ?? 0) + (header?.offsetHeight || 50));
  }

  const mode = timelineProps.mode ?? 'explore';
  const activeHeight = panelHeight;
  const contentElement = box.current?.querySelector<HTMLElement>('.controller-content');
  const naturalMax = naturalPanelHeight(contentElement, box.current?.querySelector<HTMLElement>('.controller-handlebar'));
  const panelMax = measuredPanelMax ?? clampPanelHeight(Number.POSITIVE_INFINITY, naturalMax, viewport.height, mobile || short);
  const resizeHandle = <div className="controller-resize-handle" role="separator" aria-orientation="horizontal"
    aria-label={t('调整时间控制器高度')} aria-valuemin={Math.min(50,panelMax)} aria-valuemax={panelMax} aria-valuenow={Math.min(activeHeight,panelMax)}
    tabIndex={0} onPointerDown={e=>{if(e.button!==0)return; if(effectiveDensity==='collapsed')setPanelHeight(50); resizeDrag.current={pointer:e.pointerId,startY:e.clientY,height:activeHeight,...(floating?{bottomY:preference.position.y+activeHeight}:{})}; e.currentTarget.setPointerCapture?.(e.pointerId); box.current?.setAttribute('data-resizing','true');setResizeActive(true);if(!floating)onResizeInteractionChange?.(true);}}
    onPointerMove={e=>{const d=resizeDrag.current;if(d?.pointer===e.pointerId){d.height=d.height+d.startY-e.clientY;d.startY=e.clientY;if(resizeFrame.current!==null)cancelAnimationFrame(resizeFrame.current);resizeFrame.current=requestAnimationFrame(()=>{resize(d.height,false,d.bottomY);resizeFrame.current=null;});}}}
    onPointerUp={e=>{const d=resizeDrag.current;if(d?.pointer===e.pointerId){if(resizeFrame.current!==null)cancelAnimationFrame(resizeFrame.current);resize(d.height,true,d.bottomY);resizeDrag.current=null;setResizeActive(false);if(!floating)onResizeInteractionChange?.(false);box.current?.removeAttribute('data-resizing');}}}
    onPointerCancel={()=>{const d=resizeDrag.current;if(d){if(resizeFrame.current!==null)cancelAnimationFrame(resizeFrame.current);resize(d.height,true,d.bottomY);}resizeDrag.current=null;resizeFrame.current=null;setResizeActive(false);if(!floating)onResizeInteractionChange?.(false);box.current?.removeAttribute('data-resizing');}}
    onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();resize(activeHeight+(e.key==='ArrowUp'?24:-24),true,floating?preference.position.y+activeHeight:undefined);}}}>
    <span aria-hidden="true" />
  </div>;
  return <>
  <div className={`time-controller ${floating?'is-floating':'is-docked'} mode-${mode} ${mobile||short?'is-small-viewport':''}`} data-density={effectiveDensity}
    ref={box} style={{...(floating?{left:preference.position.x,top:preference.position.y}:{}),height:panelHeight,...(mobile||short?{maxHeight:'30dvh'}:{})}}>
    <div className="controller-handlebar">
      <button className="controller-grip" aria-label={t(floating?'移动时间控制器':'切换时间控制器密度')} title={t(floating?'拖动移动；方向键微调':'点击展开或收起')}
        onClick={()=>{if(!floating)resize(effectiveDensity==='collapsed'?naturalPanelHeight(box.current?.querySelector<HTMLElement>('.controller-content'),box.current?.querySelector<HTMLElement>('.controller-handlebar')):50);}}
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
      <div className="controller-quick-controls"><CollapsedTimeControls year={timelineProps.year} viewWindow={timelineProps.viewWindow} showRail={effectiveDensity==='collapsed'}
        isPlaying={timelineProps.isPlaying} onYearChange={timelineProps.onYearChange} onYearCommit={timelineProps.onYearCommit} onPlayToggle={timelineProps.onPlayToggle} rangeControlsRef={setRangeControlsTarget} /></div>
      <div className="controller-layout-actions">
        {!mobile && <button aria-label={t(floating?'停靠时间控制器':'悬浮时间控制器')} onClick={toggleFloating}><span className={floating?'dock-glyph':'float-glyph'} aria-hidden="true" />{t(floating?'停靠':'悬浮')}</button>}
        {floating && <button aria-label={t('归位')} title={t('归位')} onClick={resetFloatingPosition}><span className="reset-glyph" aria-hidden="true">↻</span>{t("归位")}</button>}
        <button aria-label={t(effectiveDensity==='collapsed'?'展开时间控制器':'收起时间控制器')} aria-expanded={effectiveDensity!=='collapsed'} aria-controls="time-controller-content"
          onClick={toggleDensity}><span className={effectiveDensity==='collapsed'?'expand-glyph':'collapse-glyph'} aria-hidden="true" />{t(effectiveDensity==='collapsed'?'展开':'收起')}</button>
      </div>
    </div>
    {resizeHandle}<div id="time-controller-content" className="controller-content" aria-hidden={panelHeight<=50}><Timeline {...timelineProps} density="expanded" showPrimaryControls={false} rangeControlsTarget={rangeControlsTarget}/></div>
  </div>
  </>;
}
