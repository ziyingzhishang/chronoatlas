import { useMemo, useState } from 'react';
import type { DetailEntity } from '../domain/detail-entity';
import type { CityHistoryTimelineNode, CityHistoryTimelineNodeType } from '../domain/city-timeline';

type Filter = 'all' | CityHistoryTimelineNodeType;

interface CityHistoryTimelineProps {
  nodes: CityHistoryTimelineNode[];
  missingData?: string[];
  onOpenEntity: (entity: DetailEntity) => void;
}

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'polity', label: '政权' },
  { value: 'person', label: '人物' },
  { value: 'event', label: '事件' },
  { value: 'heritage', label: '遗产' },
  { value: 'place', label: '地点' },
];

function formatYear(year?: number, periodLabel?: string): string {
  if (periodLabel) return periodLabel;
  if (year === undefined) return '年代待考';
  return year < 0 ? `前${Math.abs(year)}年` : `${year}年`;
}

export function CityHistoryTimeline({ nodes, missingData = [], onOpenEntity }: CityHistoryTimelineProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const visibleNodes = useMemo(() => filter === 'all' ? nodes : nodes.filter((node) => node.type === filter), [filter, nodes]);

  return <section className="city-history-timeline" aria-label="城市历史时间轴">
    <div className="city-history-timeline-heading">
      <span className="eyebrow">城市历史</span>
      <h2>历史时间轴</h2>
    </div>
    <div className="city-history-timeline-filters" role="group" aria-label="按实体类型筛选">
      {filters.map(({ value, label }) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
    </div>
    {missingData.length > 0 && <div className="city-history-timeline-missing" role="status">
      {missingData.map((message) => <p key={message}>{message}</p>)}
    </div>}
    <ol className="city-history-timeline-list">
      {visibleNodes.map((node) => <li key={node.id} data-entity-type={node.type}>
        <span className="city-history-timeline-year">{formatYear(node.year, node.periodLabel)}</span>
        <button type="button" onClick={() => onOpenEntity(node.entity)}>{node.label}</button>
      </li>)}
      {visibleNodes.length === 0 && <li className="detail-note">暂无符合筛选条件的节点</li>}
    </ol>
  </section>;
}
