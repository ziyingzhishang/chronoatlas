import type { KeyboardEvent } from 'react';
import type { DetailEntity } from '../domain/detail-entity';
import type { PolityStudyView } from '../domain/study-view';
import type { HistoricalClaim } from '../domain/types';
import { formatHistoricalYear } from '../domain/timeline';
import { useLocale } from '../i18n/locale';
import { toPolityRelationshipGraphView, type RelationshipGraphNode, type RelationshipGraphView } from './relationship-graph-model';
import { useHistoricalContent } from '../content/ContentContext';
import { ReaderNotes } from './ReaderNotes';
import { toReaderSources } from '../presentation/reader-content';
import { readerRelationshipLabel } from '../presentation/relationship-label';

export type RelationshipGraphCategory = 'governance' | 'kinship' | 'allianceConflict' | 'eventParticipation' | 'heritage' | 'context';
export type RelationshipGraphScope = 'current-fact' | 'detail-linked';

type GraphNode = RelationshipGraphNode;

export interface RelationshipGraphEdge {
  claim: HistoricalClaim;
  category: RelationshipGraphCategory;
  from: GraphNode;
  to: GraphNode;
  sourceAvailable: boolean;
  scope: RelationshipGraphScope;
}

const categoryForPredicate: Record<string, RelationshipGraphCategory> = {
  founded: 'governance', served: 'governance', appointed: 'governance', succeeded: 'governance', ruled: 'governance',
  'parent-of': 'kinship', 'child-of': 'kinship', 'grandparent-of': 'kinship', 'grandchild-of': 'kinship', 'sibling-of': 'kinship', 'spouse-of': 'kinship',
  'ally-of': 'allianceConflict', 'enemy-of': 'allianceConflict',
  'participated-in': 'eventParticipation',
  'related-to': 'context',
  'left-heritage': 'heritage', commissioned: 'heritage',
};

const categoryLabels: Record<RelationshipGraphCategory, string> = {
  governance: '治理／君臣', kinship: '亲属', allianceConflict: '联盟与对立', eventParticipation: '事件参与', heritage: '遗产关联', context: '历史关联',
};

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
  const predicate = t(readerRelationshipLabel(edge.claim.predicate));
  const category = t(categoryLabels[edge.category]);
  const scope = t(edge.scope === 'current-fact' ? '当前地图时段' : '与本专题相关');
  return `${edge.from.label} · ${category} · ${predicate} · ${edge.to.label} · ${relationshipDateLabel(edge.claim)} · ${scope}`;
}

type RelationshipGraphProps = {
  graph?: RelationshipGraphView;
  view?: PolityStudyView;
  onOpenEntity?: (entity: DetailEntity) => void;
};

export function RelationshipGraph({ graph, view, onOpenEntity }: RelationshipGraphProps) {
  const { t } = useLocale();
  const { catalog } = useHistoricalContent();
  const knownSourceIds = new Set(catalog.sources.map((source) => source.id));
  const normalizedGraph = graph ?? (view ? toPolityRelationshipGraphView(view) : undefined);
  if (!normalizedGraph) return null;
  const detailGraphNodes = normalizedGraph.detailNodes ?? [];
  const localizeNode = (node: GraphNode): GraphNode => ({ ...node, label: t(node.label) });
  const nodes = [...new Map([...normalizedGraph.currentNodes, ...detailGraphNodes].map(localizeNode).map((node) => [node.id, node])).values()];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const currentClaimIds = new Set(normalizedGraph.currentClaims.map((claim) => claim.id));
  const claims = [...new Map([...normalizedGraph.currentClaims, ...(normalizedGraph.detailClaims ?? [])].map((claim) => [claim.id, claim])).values()];
  const edges = claims.flatMap((claim): RelationshipGraphEdge[] => {
    const category = classifyRelationshipClaim(claim);
    const from = nodeById.get(claim.subjectId);
    const to = claim.objectId ? nodeById.get(claim.objectId) : undefined;
    if (!category || !from || !to) return [];
    return [{
      claim, category, from, to,
      sourceAvailable: claim.sourceIds.length > 0 && claim.sourceIds.every((id) => knownSourceIds.has(id)),
      scope: currentClaimIds.has(claim.id) ? 'current-fact' : 'detail-linked',
    }];
  });
  const currentEntityIds = new Set(normalizedGraph.currentNodes.map((node) => node.id));
  const detailEntityIds = new Set(detailGraphNodes.map((node) => node.id));
  const detailOnlyNodes = nodes.filter((node) => detailEntityIds.has(node.id) && !currentEntityIds.has(node.id));
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
    <div className="relationship-graph" role="img" aria-label={t(normalizedGraph.subject.kind === 'place' ? '城市关系网络' : '人物关系网络')}>
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
            return <li key={`text-${edge.claim.id}`}>
              <button type="button" aria-label={summary} onClick={() => openNode(edge.to)}>{summary}</button>
              <RelationshipEdgeEvidence edge={edge} t={t} />
            </li>;
          })}</ul> : <p className="relationship-category-empty">{t('暂无已收录关系')}</p>}
        </section>)}
        {detailOnlyNodes.length > 0 && <section className="relationship-category relationship-category-detail" aria-labelledby="relationship-category-detail">
          <h4 id="relationship-category-detail">{t('专题相关内容')}</h4>
          <p className="relationship-category-note">{t('以下内容与本专题相关，未必发生在地图所示年份。')}</p>
          <ul>{detailOnlyNodes.map((node) => {
            const summary = `${node.label} · ${t('与本专题相关')}`;
            return <li key={`detail-${node.id}`}><button type="button" aria-label={summary} onClick={() => openNode(node)}>{summary}</button></li>;
          })}</ul>
        </section>}
      </div>
    </div>
  );
}

function RelationshipEdgeEvidence({ edge }: { edge: RelationshipGraphEdge; t: (text: string) => string }) {
  const { catalog } = useHistoricalContent();
  return <ReaderNotes className="relationship-edge-evidence" note={{
    dateDescription: relationshipDateLabel(edge.claim),
    uncertainty: edge.claim.uncertaintyNote,
    sources: toReaderSources(edge.claim.sourceIds, catalog.sources),
  }} />;
}

function GraphEdge({ edge, positions, summary, t }: { edge: RelationshipGraphEdge; positions: Map<string, { x: number; y: number }>; summary: string; t: (text: string) => string }) {
  const from = positions.get(edge.from.id)!;
  const to = positions.get(edge.to.id)!;
  const label = `${t(categoryLabels[edge.category])} · ${t(readerRelationshipLabel(edge.claim.predicate))}`;
  return <g className={`relationship-edge relationship-edge-${edge.category} relationship-edge-${edge.scope}`} aria-label={summary}><title>{summary}</title><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} /><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 4}>{label}</text></g>;
}
