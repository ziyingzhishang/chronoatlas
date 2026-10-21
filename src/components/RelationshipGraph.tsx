import type { PolityStudyView } from '../domain/study-view';
import type { HistoricalClaim } from '../domain/types';
import { useLocale } from '../i18n/locale';

interface GraphNode {
  id: string;
  label: string;
  kind: 'person' | 'polity' | 'heritage';
}

const edgeLabel: Record<string, string> = { founded: '建立', ruled: '统治', commissioned: '营建', 'left-heritage': '遗留' };

export function RelationshipGraph({ view }: { view: PolityStudyView }) {
  const { t } = useLocale();
  const nodes: GraphNode[] = [
    { id: view.subject.id, label: view.subject.name, kind: 'polity' },
    ...view.people.map((person) => ({ id: person.id, label: person.name, kind: 'person' as const })),
    ...view.heritage.map((asset) => ({ id: asset.id, label: asset.name, kind: 'heritage' as const })),
  ];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges = view.claims.filter((claim) => claim.objectId && nodeById.has(claim.subjectId) && nodeById.has(claim.objectId));
  const positions = new Map(nodes.map((node, index) => [node.id, { x: 30 + (index % 3) * 130, y: 30 + Math.floor(index / 3) * 58 }]));

  return (
    <div className="relationship-graph" role="img" aria-label={t('人物关系网络')}>
      <svg viewBox="0 0 420 190" aria-hidden="true">
        {edges.map((claim) => <GraphEdge key={claim.id} claim={claim} positions={positions} label={t(edgeLabel[claim.predicate] ?? claim.predicate)} />)}
        {nodes.map((node) => { const position = positions.get(node.id)!; return <g key={node.id} className={`relationship-node relationship-node-${node.kind}`} transform={`translate(${position.x},${position.y})`}><circle r="14" /><text x="20" y="4">{node.label}</text></g>; })}
      </svg>
      <ul className="relationship-graph-text">{edges.map((claim) => <li key={`text-${claim.id}`}>{nodeById.get(claim.subjectId)?.label} · {t(edgeLabel[claim.predicate] ?? claim.predicate)} · {nodeById.get(claim.objectId!)?.label}</li>)}</ul>
    </div>
  );
}

function GraphEdge({ claim, positions, label }: { claim: HistoricalClaim; positions: Map<string, { x: number; y: number }>; label: string }) {
  const from = positions.get(claim.subjectId)!;
  const to = positions.get(claim.objectId!)!;
  return <g className="relationship-edge"><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} /><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 4}>{label}</text></g>;
}
