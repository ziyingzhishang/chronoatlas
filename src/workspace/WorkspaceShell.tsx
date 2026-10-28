import {
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

interface WorkspaceShellProps {
  mapPane: ReactNode;
  timeNavigationPane?: ReactNode;
  topicPane?: ReactNode;
  topicWidthPercent: number;
  onTopicWidthChange: (widthPercent: number) => void;
  singleTopicView: boolean;
  exclusiveTimeAnalysis?: boolean;
}

const MIN_TOPIC_WIDTH = 34;
const MAX_TOPIC_WIDTH = 62;
const WIDTH_STEP = 2;
const MIN_MAP_PIXELS = 560;
const MIN_TOPIC_PIXELS = 420;

export function clampTopicWidth(width: number) {
  return Math.min(MAX_TOPIC_WIDTH, Math.max(MIN_TOPIC_WIDTH, Math.round(width)));
}

export function topicWidthBounds(containerWidth: number) {
  if (!containerWidth) return { min: MIN_TOPIC_WIDTH, max: MAX_TOPIC_WIDTH };
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    min: round(Math.max(MIN_TOPIC_WIDTH, (MIN_TOPIC_PIXELS / containerWidth) * 100)),
    max: round(Math.min(MAX_TOPIC_WIDTH, ((containerWidth - MIN_MAP_PIXELS) / containerWidth) * 100)),
  };
}

export function WorkspaceShell({ mapPane, timeNavigationPane, topicPane, topicWidthPercent, onTopicWidthChange, singleTopicView, exclusiveTimeAnalysis = false }: WorkspaceShellProps) {
  const shell = useRef<HTMLDivElement>(null);
  const dragCleanup = useRef<(() => void) | undefined>();
  const [containerWidth, setContainerWidth] = useState(0);
  const hasTopic = Boolean(topicPane);
  const bounds = topicWidthBounds(containerWidth);
  const boundedWidth = Math.min(bounds.max, Math.max(bounds.min, topicWidthPercent));
  const width = singleTopicView ? 100 : boundedWidth;
  const topic = topicPane && applyTopicPresentation(topicPane, width, exclusiveTimeAnalysis);

  useLayoutEffect(() => {
    const element = shell.current;
    if (!element) return undefined;
    const update = () => setContainerWidth(element.getBoundingClientRect().width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function updateWidth(nextWidth: number) {
    onTopicWidthChange(Math.round(Math.min(bounds.max, Math.max(bounds.min, nextWidth)) * 100) / 100);
  }

  function handleSeparatorKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    let nextWidth: number | undefined;
    if (event.key === 'ArrowLeft') nextWidth = topicWidthPercent + WIDTH_STEP;
    if (event.key === 'ArrowRight') nextWidth = topicWidthPercent - WIDTH_STEP;
    if (event.key === 'Home') nextWidth = bounds.min;
    if (event.key === 'End') nextWidth = bounds.max;
    if (nextWidth === undefined) return;
    event.preventDefault();
    updateWidth(nextWidth);
  }

  function handleSeparatorPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const container = shell.current?.getBoundingClientRect();
    if (!container?.width) return;
    const handleMove = (moveEvent: PointerEvent) => updateWidth(((container.right - moveEvent.clientX) / container.width) * 100);
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

  const mapHiddenForTopic = hasTopic && singleTopicView && !exclusiveTimeAnalysis;
  const hiddenMapProps = mapHiddenForTopic ? { inert: '', 'aria-hidden': true } : {};
  const hiddenMapContentProps = exclusiveTimeAnalysis ? { inert: '', 'aria-hidden': true } : {};
  return <div ref={shell} className={`workspace-shell${hasTopic ? ' has-topic' : ''}${mapHiddenForTopic ? ' single-topic-view' : ''}${exclusiveTimeAnalysis ? ' time-analysis-exclusive' : ''}`}>
    <section className={`workspace-map-pane${exclusiveTimeAnalysis ? ' time-analysis-exclusive' : ''}`} aria-label="地图工作区" {...hiddenMapProps}>
      <div className="workspace-map-content" {...hiddenMapContentProps}>{mapPane}</div>
      {timeNavigationPane}
    </section>
    {hasTopic && !singleTopicView && !exclusiveTimeAnalysis && <div
      className="workspace-divider"
      role="separator"
      tabIndex={0}
      aria-label="调整地图与专题栏宽度"
      aria-orientation="vertical"
      aria-valuemin={bounds.min}
      aria-valuemax={bounds.max}
      aria-valuenow={boundedWidth}
      onKeyDown={handleSeparatorKeyDown}
      onPointerDown={handleSeparatorPointerDown}
    />}
    {topic}
  </div>;
}

function applyTopicPresentation(node: ReactNode, widthPercent: number, hidden: boolean) {
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{
    style?: CSSProperties;
    inert?: '';
    'aria-hidden'?: boolean;
    hidden?: boolean;
  }>;
  return cloneElement(element, {
    style: { ...element.props.style, width: `${widthPercent}%` },
    inert: hidden ? '' : undefined,
    'aria-hidden': hidden || undefined,
    hidden: hidden || undefined,
  });
}
