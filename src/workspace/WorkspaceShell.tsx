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
  topicPane?: ReactNode;
  topicWidthPercent: number;
  onTopicWidthChange: (widthPercent: number) => void;
  singleTopicView: boolean;
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

export function WorkspaceShell({ mapPane, topicPane, topicWidthPercent, onTopicWidthChange, singleTopicView }: WorkspaceShellProps) {
  const shell = useRef<HTMLDivElement>(null);
  const dragCleanup = useRef<(() => void) | undefined>();
  const [containerWidth, setContainerWidth] = useState(0);
  const hasTopic = Boolean(topicPane);
  const bounds = topicWidthBounds(containerWidth);
  const boundedWidth = Math.min(bounds.max, Math.max(bounds.min, topicWidthPercent));
  const width = singleTopicView ? 100 : boundedWidth;
  const topic = topicPane && applyWidth(topicPane, width);

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

  const hiddenMapProps = hasTopic && singleTopicView ? { inert: '', 'aria-hidden': true } : {};
  return <div ref={shell} className={`workspace-shell${hasTopic ? ' has-topic' : ''}${hasTopic && singleTopicView ? ' single-topic-view' : ''}`}>
    <section className="workspace-map-pane" aria-label="地图工作区" {...hiddenMapProps}>{mapPane}</section>
    {hasTopic && !singleTopicView && <div
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

function applyWidth(node: ReactNode, widthPercent: number) {
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{ style?: CSSProperties }>;
  return cloneElement(element, { style: { ...element.props.style, width: `${widthPercent}%` } });
}
