import type { CapitalTerm, Polity, Place } from '../domain/types';
import { capitalHistory } from './capital-history';
import { places } from './places';
import { polities } from './polities';

export interface CapitalPolityCoverage {
  polityId: string;
  polityName: string;
  recordCount: number;
  placeIds: string[];
  missingPlaceIds: string[];
  noSourceRecordIds: string[];
  noTimeRecordIds: string[];
  placeholderRecordIds: string[];
  uncertainRecordIds: string[];
  hasMigrationCoverage: boolean;
  hasMultiCapitalCoverage: boolean;
  hasMobileCenterCoverage: boolean;
  qualified: boolean;
}

export interface CapitalCoverageSummary {
  totalPolities: number;
  qualifiedPolities: number;
  qualificationRate: number;
  gapPolityIds: string[];
}

export interface CapitalCoverageReport {
  polities: CapitalPolityCoverage[];
  summary: CapitalCoverageSummary;
}

const placeById = new Map(places.map((place) => [place.id, place]));

function recordId(record: CapitalTerm, index: number): string {
  return `${record.polityId}:${index}`;
}

function isPlaceholder(record: CapitalTerm): boolean {
  const text = record.notes ?? '';
  return /占位|未细分|沿用现有目录首都|待逐段补充/.test(text);
}

function isUncertain(record: CapitalTerm, place: Place | undefined): boolean {
  return record.status === 'uncertain'
    || record.role === 'disputed'
    || record.confidence === 'low'
    || place?.mappingStatus === 'debated';
}

function hasOverlappingRecords(records: CapitalTerm[]): boolean {
  for (let left = 0; left < records.length; left += 1) {
    for (let right = left + 1; right < records.length; right += 1) {
      if (records[left].placeId === records[right].placeId) continue;
      if (records[left].validFrom <= records[right].validTo
        && records[right].validFrom <= records[left].validTo) return true;
    }
  }
  return false;
}

function hasNonOverlappingDifferentPlaceRecords(records: CapitalTerm[]): boolean {
  for (let left = 0; left < records.length; left += 1) {
    for (let right = left + 1; right < records.length; right += 1) {
      if (records[left].placeId === records[right].placeId) continue;
      if (records[left].validTo < records[right].validFrom
        || records[right].validTo < records[left].validFrom) return true;
    }
  }
  return false;
}

function reportForPolity(polity: Polity): CapitalPolityCoverage {
  const records = capitalHistory.filter((record) => record.polityId === polity.id);
  const missingPlaceIds = records
    .filter((record) => !placeById.has(record.placeId))
    .map((record) => record.placeId);
  const noSourceRecordIds = records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => record.sourceIds.length === 0)
    .map(({ record, index }) => recordId(record, index));
  const noTimeRecordIds = records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => !Number.isFinite(record.validFrom) || !Number.isFinite(record.validTo))
    .map(({ record, index }) => recordId(record, index));
  const placeholderRecordIds = records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => isPlaceholder(record))
    .map(({ record, index }) => recordId(record, index));
  const uncertainRecordIds = records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => isUncertain(record, placeById.get(record.placeId)))
    .map(({ record, index }) => recordId(record, index));
  const placeIds = [...new Set(records.map((record) => record.placeId))];
  const hasMigrationCoverage = hasNonOverlappingDifferentPlaceRecords(records);
  const hasMobileCenterCoverage = records.some((record) => (
    record.role === 'mobile_court' || placeById.get(record.placeId)?.pointType === 'mobile-centre'
  ));
  const qualified = records.length > 0
    && missingPlaceIds.length === 0
    && noSourceRecordIds.length === 0
    && noTimeRecordIds.length === 0
    && placeholderRecordIds.length === 0
    && uncertainRecordIds.length === 0;

  return {
    polityId: polity.id,
    polityName: polity.name,
    recordCount: records.length,
    placeIds,
    missingPlaceIds,
    noSourceRecordIds,
    noTimeRecordIds,
    placeholderRecordIds,
    uncertainRecordIds,
    hasMigrationCoverage,
    hasMultiCapitalCoverage: hasOverlappingRecords(records),
    hasMobileCenterCoverage,
    qualified,
  };
}

export function getCapitalCoverageReport(): CapitalCoverageReport {
  const reports = polities.map(reportForPolity);
  const qualifiedPolities = reports.filter((report) => report.qualified).length;
  return {
    polities: reports,
    summary: {
      totalPolities: reports.length,
      qualifiedPolities,
      qualificationRate: reports.length === 0 ? 1 : qualifiedPolities / reports.length,
      gapPolityIds: reports.filter((report) => !report.qualified).map((report) => report.polityId),
    },
  };
}
