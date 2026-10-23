import { useState, type KeyboardEvent } from 'react';
import type { DetailEntity } from '../domain/detail-entity';
import type { PolityStudyView } from '../domain/study-view';
import type { ClaimEvidenceType, HistoricalClaim } from '../domain/types';
import { sourceById } from '../data/sources';
import { formatHistoricalYear } from '../domain/timeline';
import { useLocale } from '../i18n/locale';

export type RelationshipGraphCategory = 'governance' | 'kinship' | 'allianceConflict' | 'eventParticipation' | 'heritage' | 'context';
export type RelationshipGraphScope = 'current-fact' | 'detail-linked';

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

const predicateLabels: Record<string, string> = {
  founded: '建立', ruled: '统治', served: '任职／效力', appointed: '任用', succeeded: '承接',
  'parent-of': '亲属：父母', 'child-of': '亲属：子女', 'grandparent-of': '亲属：祖父母', 'grandchild-of': '亲属：孙辈', 'sibling-of': '亲属：兄弟姐妹', 'spouse-of': '亲属：配偶',
  'ally-of': '联盟', 'enemy-of': '对立', 'participated-in': '参与事件', 'related-to': '历史关联', commissioned: '营建', 'left-heritage': '遗留',
};

const categoryLabels: Record<RelationshipGraphCategory, string> = {
  governance: '治理／君臣', kinship: '亲属', allianceConflict: '联盟与对立', eventParticipation: '事件参与', heritage: '遗产关联', context: '历史关联',
};

const datePrecisionLabels: Record<HistoricalClaim['datePrecision'], string> = {
  day: '日', year: '年', approximate: '约年', range: '范围', century: '世纪', unknown: '未知',
};

const knownSourceIds = new Set(Object.keys(sourceById));

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
  const scope = t(edge.scope === 'current-fact' ? '本年事实' : '详情关联／非本年事实');
  return `${edge.from.label} · ${category} · ${predicate} · ${t('方向：')}${edge.from.label} → ${edge.to.label} · ${relationshipDateLabel(edge.claim)} · ${t('时间精度：')}${precision} · ${source} · ${scope}`;
}

export function RelationshipGraph({ view, onOpenEntity }: { view: PolityStudyView; onOpenEntity?: (entity: DetailEntity) => void }) {
  const { t } = useLocale();
  const detailLinkedEvents = [...view.detailLinkedEvents, ...view.detailLinkedTransitionEvents];
  const rawNodes: GraphNode[] = [
    { id: view.subject.id, label: view.subject.name, kind: 'polity' },
    ...view.people.map((person) => ({ id: person.id, label: person.name, kind: 'person' as const })),
    ...view.detailLinkedPeople.map((person) => ({ id: person.id, label: person.name, kind: 'person' as const })),
    ...view.events.map((event) => ({ id: event.id, label: t(event.title), kind: 'event' as const })),
    ...detailLinkedEvents.map((event) => ({ id: event.id, label: t(event.title), kind: 'event' as const })),
    ...view.heritage.map((asset) => ({ id: asset.id, label: asset.name, kind: 'heritage' as const })),
    ...view.detailLinkedHeritage.map((asset) => ({ id: asset.id, label: asset.name, kind: 'heritage' as const })),
  ];
  const nodes = [...new Map(rawNodes.map((node) => [node.id, node])).values()];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const currentClaimIds = new Set(view.claims.map((claim) => claim.id));
  const claims = [...new Map([...view.claims, ...view.detailLinkedClaims].map((claim) => [claim.id, claim])).values()];
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
  const currentEntityIds = new Set([
    view.subject.id,
    ...view.people.map((person) => person.id),
    ...view.events.map((event) => event.id),
    ...view.heritage.map((asset) => asset.id),
  ]);
  const detailEntityIds = new Set([
    ...view.detailLinkedPeople.map((person) => person.id),
    ...detailLinkedEvents.map((event) => event.id),
    ...view.detailLinkedHeritage.map((asset) => asset.id),
  ]);
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
            return <li key={`text-${edge.claim.id}`}>
              <button type="button" aria-label={summary} onClick={() => openNode(edge.to)}>{summary}</button>
              <RelationshipEdgeEvidence edge={edge} t={t} />
            </li>;
          })}</ul> : <p className="relationship-category-empty">{t('暂无已收录关系')}</p>}
        </section>)}
        {detailOnlyNodes.length > 0 && <section className="relationship-category relationship-category-detail" aria-labelledby="relationship-category-detail">
          <h4 id="relationship-category-detail">{t('详情关联／非本年事实')}</h4>
          <p className="relationship-category-note">{t('关系图谱中的详情关联／非本年事实；时间、有效期与政权归属仍以各自证据为准。')}</p>
          <ul>{detailOnlyNodes.map((node) => {
            const summary = `${node.label} · ${t('详情关联／非本年事实')}`;
            return <li key={`detail-${node.id}`}><button type="button" aria-label={summary} onClick={() => openNode(node)}>{summary}</button></li>;
          })}</ul>
        </section>}
      </div>
    </div>
  );
}

function RelationshipEdgeEvidence({ edge, t }: { edge: RelationshipGraphEdge; t: (text: string) => string }) {
  const [expanded, setExpanded] = useState(false);
  const predicate = t(predicateLabels[edge.claim.predicate] ?? edge.claim.predicate);
  const evidenceId = `relationship-edge-evidence-${edge.claim.id}`;
  const toggle = () => setExpanded((value) => !value);
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggle();
  };

  return <div className="relationship-edge-evidence">
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={evidenceId}
      aria-label={`${t(expanded ? '收起边证据' : '查看边证据')}：${edge.from.label} · ${predicate}`}
      onClick={toggle}
      onKeyDown={handleKeyDown}
    >
      {t(expanded ? '收起边证据' : '查看边证据')}
    </button>
    {expanded && <section id={evidenceId} className="relationship-edge-evidence-detail" role="region" aria-label={`${t('关系边证据：')}${edge.from.label} → ${edge.to.label}`}>
      <p>{t('有效期：')}{relationshipDateLabel(edge.claim)} · {t('时间精度：')}{t(datePrecisionLabels[edge.claim.datePrecision])}</p>
      <p>{t('证据类型：')}{t(claimEvidenceTypeLabel(edge.claim.evidenceType))} · {t('可信度：')}{t(confidenceLabel(edge.claim.confidence))}</p>
      <p>{t('不确定性：')}{t(edge.claim.uncertaintyNote ?? '未记录不确定性')}</p>
      <ul aria-label={t('关系来源：')}>
        {edge.claim.sourceIds.length > 0 ? edge.claim.sourceIds.map((sourceId) => <RelationshipEdgeSource key={sourceId} sourceId={sourceId} t={t} />) : <li>{t('暂无可解析来源')}</li>}
      </ul>
    </section>}
  </div>;
}

function RelationshipEdgeSource({ sourceId, t }: { sourceId: string; t: (text: string) => string }) {
  const source = sourceById[sourceId];
  if (!source) return <li>{t(sourceId)} · {t('来源未解析')}</li>;
  const urls = sourceUrls(source.urlOrCitation);
  return <li>
    {urls.length > 0 ? urls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer">{t(source.title)}</a>) : <span>{t(source.title)}</span>}
    <span> · {t(urls.length > 0 ? '来源链接' : '书目引文')}</span>
    {urls.length === 0 && source.urlOrCitation && <small> · {t(source.urlOrCitation)}</small>}
  </li>;
}

function sourceUrls(citation?: string) {
  return (citation ?? '').split(/[；;]/).map((part) => part.trim()).filter((part) => /^https?:\/\//.test(part));
}

function claimEvidenceTypeLabel(type: ClaimEvidenceType) {
  return type === 'explicit-record' ? '明确记载' : type === 'archaeology' ? '考古证据' : type === 'cross-checked' ? '交叉核验' : type === 'inference' ? '推断' : '传统记载';
}

function confidenceLabel(confidence: HistoricalClaim['confidence']) {
  return confidence === 'high' ? '高' : confidence === 'medium' ? '中' : '低';
}

function GraphEdge({ edge, positions, summary, t }: { edge: RelationshipGraphEdge; positions: Map<string, { x: number; y: number }>; summary: string; t: (text: string) => string }) {
  const from = positions.get(edge.from.id)!;
  const to = positions.get(edge.to.id)!;
  const label = `${t(categoryLabels[edge.category])} · ${t(predicateLabels[edge.claim.predicate] ?? edge.claim.predicate)}`;
  return <g className={`relationship-edge relationship-edge-${edge.category} relationship-edge-${edge.scope}`} aria-label={summary}><title>{summary}</title><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} /><text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 4}>{label}</text></g>;
}
