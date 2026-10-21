import type { KeyboardEvent } from 'react';
import type { DetailEntity } from '../domain/detail-entity';
import type { PolityStudyView } from '../domain/study-view';
import type { HistoricalClaim } from '../domain/types';
import { sourceNotes } from '../data/sources';
import { formatHistoricalYear } from '../domain/timeline';
import { useLocale } from '../i18n/locale';

export type RelationshipGraphCategory = 'governance' | 'kinship' | 'allianceConflict' | 'eventParticipation' | 'heritage';

interface GraphNode {
  id: string;
  label: string;
  kind: DetailEntity['type'];
}

export interface RelationshipGraphEdge {
  claim: HistoricalClaim;
  category: RelationshipGraphCategory;
  from: GraphNode;
  to: GraphNode;
  sourceAvailable: boolean;
}

const categoryForPredicate: Record<string, RelationshipGraphCategory> = {
  founded: 'governance', served: 'governance', appointed: 'governance', succeeded: 'governance', ruled: 'governance',
  'parent-of': 'kinship', 'child-of': 'kinship', 'sibling-of': 'kinship', 'spouse-of': 'kinship',
  'ally-of': 'allianceConflict', 'enemy-of': 'allianceConflict',
  'participated-in': 'eventParticipation',
  'left-heritage': 'heritage', commissioned: 'heritage',
};

const predicateLabels: Record<string, string> = {
  founded: '建立', ruled: '统治', served: '任职／效力', appointed: '任用', succeeded: '承接',
  'parent-of': '亲属：父母', 'child-of': '亲属：子女', 'sibling-of': '亲属：兄弟姐妹', 'spouse-of': '亲属：配偶',
  'ally-of': '联盟', 'enemy-of': '对立', 'participated-in': '参与事件', commissioned: '营建', 'left-heritage': '遗留',
};

const categoryLabels: Record<RelationshipGraphCategory, string> = {
  governance: '治理／君臣', kinship: '亲属', allianceConflict: '联盟与对立', eventParticipation: '事件参与', heritage: '遗产关联',
};

const datePrecisionLabels: Record<HistoricalClaim['datePrecision'], string> = {
  day: '日', year: '年', approximate: '约年', range: '范围', century: '世纪', unknown: '未知',
};

const knownSourceIds = new Set(sourceNotes.map((source) => source.id));

export function classifyRelationshipClaim(claim: HistoricalClaim): RelationshipGraphCategory | undefined {
  return categoryForPredicate[claim.predicate];
}

export function relationshipDateLabel(claim: HistoricalClaim): string {
  if (claim.validFrom === undefined && claim.validTo === undefined) return '未知';
  const yearLabel = (year: number) => formatHistoricalYear(year).replace(/年$/, '');
  if (claim.validFrom !== undefined && claim.validTo !== undefined) {
    return claim.validFrom === claim.validTo ? `${yearLabel(claim.validFrom)}年` : `${yearLabel(claim.validFrom)}—${yearLabel(claim.validTo)}年`;
  }
  if (claim.validFrom !== undefined) return `${yearLabel(claim.validFrom)}年至今`;
  return `截至${yearLabel(claim.validTo!)}年`;
}

export function relationshipSummary(edge: RelationshipGraphEdge, t: (text: string) => string): string {
  const predicate = t(predicateLabels[edge.claim.predicate] ?? edge.claim.predicate);
  const category = t(categoryLabels[edge.category]);
  const precision = t(datePrecisionLabels[edge.claim.datePrecision]);
  const source = t(edge.sourceAvailable ? '来源：可用' : '来源：待解析');
  return `${edge.from.label} · ${category} · ${predicate} · ${t('方向：')}${edge.from.label} → ${edge.to.label} · ${relationshipDateLabel(edge.claim)} · ${t('时间精度：')}${precision} · ${source}`;
}

export function RelationshipGraph({ view, onOpenEntity }: { view: PolityStudyView; onOpenEntity?: (entity: DetailEntity) => void }) {
  const { t } = useLocale();
  const nodes: GraphNode[] = [
    { id: view.subject.id, label: view.subject.name, kind: 'polity' },
    ...view.people.map((person) => ({ id: person.id, label: person.name, kind: 'person' as const })),
    ...view.events.map((event) => ({ id: event.id, label: t(event.title), kind: 'event' as const })),
    ...view.heritage.map((asset) => ({ id: asset.id, label: asset.name, kind: 'heritage' as const })),
  ];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges = view.claims.flatMap((claim): RelationshipGraphEdge[] => {
    const category = classifyRelationshipClaim(claim);
    const from = nodeById.get(claim.subjectId);
    const to = claim.objectId ? nodeById.get(claim.objectId) : undefined;
    if (!category || !from || !to) return [];
    return [{ claim, category, from, to, sourceAvailable: claim.sourceIds.length > 0 && claim.sourceIds.every((id) => knownSourceIds.has(id)) }];
  });
  const positions = new Map(nodes.map((node, index) => [node.id, { x: 30 + (index % 3) * 130, y: 30 + Math.floor(index / 3) * 58 }]));
  const grouped = (Object.keys(categoryLabels) as RelationshipGraphCategory[]).map((category) => ({ category, edges: edges.filter((edge) => edge.category === category) }));
  const svgHeight = Math.max(190, Math.ceil(nodes.length / 3) * 58 + 30);

  const openNode = (node: GraphNode) => onOpenEntity?.({ type: node.kind, id: node.id });
  const handleNodeKeyDown = (event: KeyboardEvent<SVGGElement>, node: GraphNode) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openNode(node);
  };

  return (
    <div className="relationship-graph" role="img" aria-label={t('人物关系网络')}>
      <svg viewBox={`0 0 420 ${svgHeight}`}>
        {edges.map((edge) => <GraphEdge key={edge.claim.id} edge={edge} positions={positions} summary={relationshipSummary(edge, t)} t={t} />)}
        {nodes.map((node) => {
          const position = positions.get(node.id)!;
          return <g key={node.id} className={`relationship-node relationship-node-${node.kind}`} transform={`translate(${position.x},${position.y})`} role="link" tabIndex={0} aria-label={node.label} onClick={() => openNode(node)} onKeyDown={(event) => handleNodeKeyDown(event, node)}><circle r="14" /><text x="20" y="4">{node.label}</text></g>;
        })}
      </svg>
      <div className="relationship-graph-text">
        {grouped.map(({ category, edges: categoryEdges }) => <section key={category} className="relationship-category" aria-labelledby={`relationship-category-${category}`}>
          <h4 id={`relationship-category-${category}`}>{t(categoryLabels[category])}</h4>
          {categoryEdges.length > 0 ? <ul>{categoryEdges.map((edge) => {
            const summary = relationshipSummary(edge, t);
            return <li key={`text-${edge.claim.id}`}><button type="button" aria-label={summary} onClick={() => openNode(edge.to)}>{summary}</button></li>;
          })}</ul> : <p className="relationship-category-empty">{t('暂无已收录关系')}</p>}
        </section>)}
      </div>
    </div>
  );
}

function GraphEdge({ edge, positions, summary, t }: { edge: RelationshipGraphEdge; positions: Map<string, { x: number; y: number }>; summary: string; t: (text: string) => string }) {
  const from = positions.get(edge.from.id)!;
  const to = positions.get(edge.to.id)!;
  const label = `${t(categoryLabels[edge.category])} · ${t(predicateLabels[edge.claim.predicate] ?? edge.claim.predicate)}`;
  return <g className={`relationship-edge relationship-edge-${edge.category}`} aria-label={summary}><title>{summary}</title><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} /><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 4}>{label}</text></g>;
}
