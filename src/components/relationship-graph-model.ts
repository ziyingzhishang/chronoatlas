import type { DetailEntity } from '../domain/detail-entity';
import type { CityStudyView, PolityStudyView } from '../domain/study-view';
import type { HistoricalClaim } from '../domain/types';

export interface RelationshipGraphNode {
  id: string;
  label: string;
  kind: DetailEntity['type'];
}

export interface RelationshipGraphView {
  subject: RelationshipGraphNode;
  currentNodes: RelationshipGraphNode[];
  detailNodes?: RelationshipGraphNode[];
  currentClaims: HistoricalClaim[];
  detailClaims?: HistoricalClaim[];
}

const uniqueById = <T extends { id: string }>(items: T[]): T[] => (
  [...new Map(items.map((item) => [item.id, item])).values()]
);

const node = <K extends DetailEntity['type']>(id: string, label: string, kind: K): RelationshipGraphNode => ({ id, label, kind });

const uniqueNodes = (nodes: RelationshipGraphNode[]) => uniqueById(nodes);

const uniqueClaims = (claims: HistoricalClaim[]) => uniqueById(claims);

const nodesForPolity = (view: PolityStudyView): RelationshipGraphView => {
  const subject = node(view.subject.id, view.subject.name, 'polity');
  const currentNodes = uniqueNodes([
    subject,
    ...view.people.map((person) => node(person.id, person.name, 'person')),
    ...view.events.map((event) => node(event.id, event.title, 'event')),
    ...view.heritage.map((asset) => node(asset.id, asset.name, 'heritage')),
  ]);
  const detailNodes = uniqueNodes([
    ...view.detailLinkedPeople.map((person) => node(person.id, person.name, 'person')),
    ...view.detailLinkedEvents.map((event) => node(event.id, event.title, 'event')),
    ...view.detailLinkedTransitionEvents.map((event) => node(event.id, event.title, 'event')),
    ...view.detailLinkedHeritage.map((asset) => node(asset.id, asset.name, 'heritage')),
  ]);
  const currentClaims = uniqueClaims(view.claims);
  const currentClaimIds = new Set(currentClaims.map((claim) => claim.id));
  const detailClaims = uniqueClaims(view.detailLinkedClaims).filter((claim) => !currentClaimIds.has(claim.id));

  return { subject, currentNodes, detailNodes, currentClaims, detailClaims };
};

export function toPolityRelationshipGraphView(view: PolityStudyView): RelationshipGraphView {
  return nodesForPolity(view);
}

export function toCityRelationshipGraphView(view: CityStudyView): RelationshipGraphView {
  const subject = node(view.subject.id, view.subject.historicalName, 'place');
  const currentNodes = uniqueNodes([
    subject,
    ...view.polities.map((polity) => node(polity.id, polity.name, 'polity')),
    ...view.people.map((person) => node(person.id, person.name, 'person')),
    ...view.events.map((event) => node(event.id, event.title, 'event')),
    ...view.heritage.map((asset) => node(asset.id, asset.name, 'heritage')),
  ]);

  return {
    subject,
    currentNodes,
    detailNodes: [],
    currentClaims: uniqueClaims(view.claims),
    detailClaims: [],
  };
}
