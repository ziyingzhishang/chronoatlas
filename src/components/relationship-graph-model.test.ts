import { describe, expect, it } from 'vitest';
import { capitalHistory } from '../data/capital-history';
import { getChanganStudyBundle } from '../data/changan-study';
import { heritageAssets } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { claims } from '../data/claims';
import { buildCityStudyView, buildPolityStudyView, type StudyData } from '../domain/study-view';
import { toCityRelationshipGraphView, toPolityRelationshipGraphView } from './relationship-graph-model';

const completeStudyData: StudyData = {
  polities,
  places,
  people,
  heritage: heritageAssets,
  events: getChanganStudyBundle().events,
  claims,
  capitalTerms: capitalHistory,
};

describe('relationship graph model adapters', () => {
  it('adapts Chang’an into a graph with city, polity, person, event and heritage nodes', () => {
    const view = buildCityStudyView('changan', 650, completeStudyData)!;
    const graph = toCityRelationshipGraphView(view);

    expect(graph.subject).toEqual({ id: 'changan', label: '长安', kind: 'place' });
    expect(new Set(graph.currentNodes.map((node) => node.kind))).toEqual(
      new Set(['place', 'polity', 'person', 'event', 'heritage']),
    );
  });

  it('keeps only current-year city claims in currentClaims and deduplicates claim IDs', () => {
    const view = buildCityStudyView('changan', 650, completeStudyData)!;
    const graph = toCityRelationshipGraphView({
      ...view,
      claims: [...view.claims, ...view.claims.slice(0, 2)],
    });

    expect(new Set(graph.currentClaims.map((claim) => claim.id)).size).toBe(graph.currentClaims.length);
    expect(graph.currentClaims.every((claim) => (
      (claim.validFrom === undefined || claim.validFrom <= 650)
      && (claim.validTo === undefined || 650 <= claim.validTo)
    ))).toBe(true);
    expect(graph.detailClaims).toEqual([]);
  });

  it('preserves the existing polity graph input through the same normalized contract', () => {
    const view = buildPolityStudyView('tang', 640, completeStudyData)!;
    const graph = toPolityRelationshipGraphView(view);

    expect(graph.subject.kind).toBe('polity');
    expect(graph.currentClaims.map((claim) => claim.id)).toEqual(view.claims.map((claim) => claim.id));
    expect(graph.detailClaims?.map((claim) => claim.id)).toEqual(view.detailLinkedClaims.map((claim) => claim.id));
  });
});
