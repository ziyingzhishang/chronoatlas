import type { HeritageAsset, HistoricalEvent, Person, Place, Polity, SourceNote } from '../domain/types';
import type { HeritageDetail } from './heritage-details';
import { events as defaultEvents } from './events';
import { heritageAssets as defaultHeritageAssets } from './heritage';
import { heritageDetails as defaultHeritageDetails } from './heritage-details';
import { people as defaultPeople } from './people';
import { places as defaultPlaces } from './places';
import { polities as defaultPolities } from './polities';
import { sourceNotes as defaultSourceNotes } from './sources';

export type HeritageDetailStatus = 'complete' | 'needs-review' | 'data-missing';

export interface HeritageDetailCoverageCatalog {
  heritageAssets: readonly HeritageAsset[];
  heritageDetails: readonly HeritageDetail[];
  people: readonly Person[];
  polities: readonly Polity[];
  events: readonly HistoricalEvent[];
  places: readonly Place[];
  sourceNotes: readonly SourceNote[];
}

export interface HeritageDetailCoverageOptions {
  catalog?: HeritageDetailCoverageCatalog;
}

export interface HeritageDetailUnresolvedReferences {
  people: string[];
  polities: string[];
  events: string[];
  place: string[];
  sources: string[];
}

export interface HeritageDetailCoverageItem {
  heritageId: string;
  name: string;
  status: HeritageDetailStatus;
  detailPresent: boolean;
  missingFields: string[];
  unresolvedReferenceIds: HeritageDetailUnresolvedReferences;
  sourceIds: string[];
  unknownSourceIds: string[];
  sourceComplete: boolean;
  reviewNotes: string[];
}

export interface HeritageDetailCoverageReport {
  totalHeritageAssets: number;
  completeHeritageIds: string[];
  needsReviewHeritageIds: string[];
  uncoveredHeritageIds: string[];
  detailCoverageRate: number;
  sourceCompleteHeritageIds: string[];
  sourceCoverageRate: number;
  items: HeritageDetailCoverageItem[];
}

const defaultCatalog: HeritageDetailCoverageCatalog = {
  heritageAssets: defaultHeritageAssets,
  heritageDetails: defaultHeritageDetails,
  people: defaultPeople,
  polities: defaultPolities,
  events: defaultEvents,
  places: defaultPlaces,
  sourceNotes: defaultSourceNotes,
};

function unique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function present(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function unresolvedReferences(): HeritageDetailUnresolvedReferences {
  return { people: [], polities: [], events: [], place: [], sources: [] };
}

function buildItem(
  asset: HeritageAsset,
  detail: HeritageDetail | undefined,
  catalog: HeritageDetailCoverageCatalog,
): HeritageDetailCoverageItem {
  const missingFields: string[] = [];
  const unresolved = unresolvedReferences();
  const reviewNotes: string[] = [];
  const detailPresent = Boolean(detail);
  const sourceIds = unique([
    ...asset.sourceIds,
    ...(detail?.sourceIds ?? []),
    ...(detail?.constructionHistory.flatMap((phase) => phase.sourceIds) ?? []),
  ]);
  const knownSourceIds = new Set(catalog.sourceNotes.map((source) => source.id));
  const unknownSourceIds = sourceIds.filter((sourceId) => !knownSourceIds.has(sourceId));

  if (!detail) {
    missingFields.push('detail');
  } else {
    if (!present(detail.modernLocation)) missingFields.push('modernLocation');
    if (detail.historicalAssociations.length === 0) missingFields.push('historicalAssociations');
    if (detail.constructionHistory.length === 0) missingFields.push('constructionHistory');
    if (detail.constructionHistory.some((phase) => !present(phase.label))) {
      missingFields.push('constructionHistory.label');
    }
    if (detail.constructionHistory.some((phase) => !present(phase.period))) {
      missingFields.push('constructionHistory.period');
    }
    if (detail.constructionHistory.some((phase) => !present(phase.description))) {
      missingFields.push('constructionHistory.description');
    }
    if (detail.constructionHistory.some((phase) => (
      phase.from !== undefined && phase.to !== undefined && phase.from > phase.to
    ))) {
      missingFields.push('constructionHistory.range');
    }
    if (detail.survivingFeatures.length === 0) missingFields.push('survivingFeatures');
    if (!present(detail.presentDayValue)) missingFields.push('presentDayValue');
    if (!present(detail.uncertaintyNote)) missingFields.push('uncertaintyNote');
    if (detail.sourceIds.length === 0) missingFields.push('sourceIds');
    if (detail.constructionHistory.some((phase) => phase.sourceIds.length === 0)) {
      missingFields.push('constructionHistory.sourceIds');
    }

    const peopleById = new Set(catalog.people.map((person) => person.id));
    const politiesById = new Set(catalog.polities.map((polity) => polity.id));
    const eventsById = new Set(catalog.events.map((event) => event.id));
    const placesById = new Set(catalog.places.map((place) => place.id));
    unresolved.people = unique(detail.associatedPeople.filter((id) => !peopleById.has(id)));
    unresolved.polities = unique(detail.associatedPolities.filter((id) => !politiesById.has(id)));
    unresolved.events = unique(detail.associatedEvents.filter((id) => !eventsById.has(id)));
    unresolved.place = placesById.has(asset.placeId) ? [] : [asset.placeId];
    unresolved.sources = unique(unknownSourceIds);
  }

  if (!detail) {
    unresolved.place = catalog.places.some((place) => place.id === asset.placeId) ? [] : [asset.placeId];
    unresolved.sources = unique(unknownSourceIds);
  }

  if (unresolved.events.length > 0) {
    reviewNotes.push(`关联事件端点未收录：${unresolved.events.join('、')}；暂不新增或推断事件端点。`);
  }
  if (unresolved.people.length > 0) {
    reviewNotes.push(`关联人物端点未收录：${unresolved.people.join('、')}；暂不新增或推断人物端点。`);
  }
  if (unresolved.polities.length > 0) {
    reviewNotes.push(`关联政权端点未收录：${unresolved.polities.join('、')}；暂不新增或推断政权端点。`);
  }
  if (unresolved.place.length > 0) {
    reviewNotes.push(`遗产所在地点未收录：${unresolved.place.join('、')}；暂不新增或推断地点端点。`);
  }
  if (unresolved.sources.length > 0) {
    reviewNotes.push(`来源端点未收录：${unresolved.sources.join('、')}；暂不新增或推断来源。`);
  }

  const hasUnresolvedReferences = Object.values(unresolved).some((ids) => ids.length > 0);
  const hasReviewSignals = hasUnresolvedReferences || unknownSourceIds.length > 0;
  const status: HeritageDetailStatus = !detail || missingFields.length > 0
    ? 'data-missing'
    : hasReviewSignals
      ? 'needs-review'
      : 'complete';

  return {
    heritageId: asset.id,
    name: asset.name,
    status,
    detailPresent,
    missingFields,
    unresolvedReferenceIds: unresolved,
    sourceIds,
    unknownSourceIds,
    sourceComplete: sourceIds.length > 0 && unknownSourceIds.length === 0,
    reviewNotes,
  };
}

export function buildHeritageDetailCoverageReport(
  options: HeritageDetailCoverageOptions = {},
): HeritageDetailCoverageReport {
  const catalog = options.catalog ?? defaultCatalog;
  const detailsById = new Map(catalog.heritageDetails.map((detail) => [detail.heritageId, detail]));
  const items = catalog.heritageAssets
    .map((asset) => buildItem(asset, detailsById.get(asset.id), catalog))
    .sort((left, right) => left.heritageId.localeCompare(right.heritageId));
  const completeHeritageIds = items.filter((item) => item.status === 'complete').map((item) => item.heritageId);
  const needsReviewHeritageIds = items.filter((item) => item.status === 'needs-review').map((item) => item.heritageId);
  const uncoveredHeritageIds = items.filter((item) => item.status === 'data-missing').map((item) => item.heritageId);
  const sourceCompleteHeritageIds = items.filter((item) => item.sourceComplete).map((item) => item.heritageId);
  const totalHeritageAssets = items.length;

  return {
    totalHeritageAssets,
    completeHeritageIds,
    needsReviewHeritageIds,
    uncoveredHeritageIds,
    detailCoverageRate: totalHeritageAssets === 0 ? 0 : completeHeritageIds.length / totalHeritageAssets,
    sourceCompleteHeritageIds,
    sourceCoverageRate: totalHeritageAssets === 0 ? 0 : sourceCompleteHeritageIds.length / totalHeritageAssets,
    items,
  };
}
