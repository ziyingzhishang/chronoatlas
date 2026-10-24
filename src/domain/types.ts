export type ControlType = 'direct' | 'indirect' | 'disputed' | 'influence' | 'unspecified';
export type Confidence = 'high' | 'medium' | 'low';
export type PolityType = 'dynasty' | 'kingdom' | 'regime' | 'tribal_polity' | 'local_rule';
export type EvidenceLevel = 'A' | 'B' | 'C' | 'D';
export type BoundaryDerivation =
  | 'direct-source'
  | 'licensed-digitization'
  | 'nearest-same-polity'
  | 'maximum-record'
  | 'administrative-synthesis'
  | 'cultural-core'
  | 'control-centers'
  | 'influence-area';
export type ReviewStatus = 'pending' | 'source-checked' | 'cross-checked';
export type CapitalRole = 'primary' | 'secondary' | 'seasonal' | 'temporary' | 'de_facto' | 'military' | 'mobile_court' | 'disputed';
export type CapitalStatus = 'formal' | 'actual' | 'claimed' | 'uncertain' | 'seasonal';
export type ClaimPerspective = 'polity' | 'city' | 'person' | 'heritage' | 'source' | 'overview';
export type ClaimEvidenceType = 'explicit-record' | 'archaeology' | 'cross-checked' | 'inference' | 'tradition';

export interface EvidenceCitation {
  title: string;
  urlOrCitation: string;
  version?: string;
  pageOrRecord?: string;
  license?: string;
}

export interface BoundaryEvidence {
  evidenceLevel: EvidenceLevel;
  derivation: BoundaryDerivation;
  reviewStatus: ReviewStatus;
  citations: EvidenceCitation[];
  uncertaintyNote: string;
}

export interface LocalizedNameMeta {
  status: 'verified' | 'source-original';
  mapLabel: string;
  sourceName?: string;
}

export interface Polity {
  id: string;
  name: string;
  type: PolityType;
  startYear: number;
  endYear: number;
  capitalPlaceId?: string;
  capitalTerms?: CapitalTerm[];
  color: string;
  description: string;
  sourceIds: string[];
  region?: 'world';
  originalName?: string;
  referenceUrl?: string;
  localizedName?: LocalizedNameMeta;
}

export interface PolityTurningPoint {
  year: number;
  title: string;
  summary: string;
  eventId?: string;
}

export interface PolityPeriod {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  datePrecision: 'year' | 'approximate' | 'range';
  summary: string;
  eventIds?: string[];
}

export interface PolityCapitalPhase {
  placeId: string;
  validFrom: number;
  validTo: number;
  role: CapitalRole;
  status: CapitalStatus;
  note?: string;
}

export interface PolityDetail {
  polityId: string;
  perspectiveSummary: string;
  foundationProcess: string[];
  turningPoints: PolityTurningPoint[];
  periods?: PolityPeriod[];
  principalFigureIds: string[];
  capitalPhases: PolityCapitalPhase[];
  heritageIds: string[];
  eventIds: string[];
  claimIds: string[];
  sourceIds: string[];
  uncertaintyNote: string;
}

export interface CapitalTerm {
  polityId: string;
  placeId: string;
  validFrom: number;
  validTo: number;
  role: CapitalRole;
  status: CapitalStatus;
  confidence: Confidence;
  sourceIds: string[];
  notes?: string;
}

export interface HistoricalClaim {
  id: string;
  subjectId: string;
  predicate: string;
  objectId?: string;
  validFrom?: number;
  validTo?: number;
  datePrecision: 'day' | 'year' | 'approximate' | 'range' | 'century' | 'unknown';
  perspective: ClaimPerspective;
  evidenceType: ClaimEvidenceType;
  confidence: Confidence;
  sourceIds: string[];
  uncertaintyNote?: string;
}

export interface Person {
  id: string;
  name: string;
  aliases?: string[];
  birthYear?: number;
  deathYear?: number;
  roles?: string[];
  polityIds?: string[];
  description: string;
  sourceIds: string[];
}

export type PersonRelationType =
  | 'parent-of'
  | 'child-of'
  | 'grandparent-of'
  | 'grandchild-of'
  | 'spouse-of'
  | 'sibling-of'
  | 'teacher-of'
  | 'student-of'
  | 'served'
  | 'appointed'
  | 'succeeded'
  | 'founded'
  | 'ruled'
  | 'ally-of'
  | 'enemy-of'
  | 'related-to'
  | 'participated-in'
  | 'commissioned';

export interface PersonOffice {
  title: string;
  polityId?: string;
  placeId?: string;
  validFrom?: number;
  validTo?: number;
  datePrecision: 'year' | 'range' | 'approximate' | 'unknown';
  sourceIds: string[];
  uncertaintyNote?: string;
}

export interface PersonDetail {
  personId: string;
  biography: string;
  offices: PersonOffice[];
  aliases: string[];
  keyEvents: string[];
  sourceIds: string[];
  uncertaintyNote?: string;
}

export interface HeritageAsset {
  id: string;
  name: string;
  placeId: string;
  type: 'palace' | 'city-site' | 'tomb' | 'temple' | 'inscription' | 'museum' | 'other';
  constructionFrom?: number;
  constructionTo?: number;
  modernStatus: 'extant' | 'archaeological-site' | 'relocated' | 'lost' | 'uncertain';
  description: string;
  sourceIds: string[];
}

export interface Place {
  id: string;
  historicalName: string;
  aliases: string[];
  relatedPlaceIds?: string[];
  modernName?: string;
  modernAdministrativeUnit?: string;
  longitude: number;
  latitude: number;
  geometry?: GeoJSON.Geometry;
  validFrom?: number;
  validTo?: number;
  notes?: string;
  sourceIds: string[];
  mappingStatus?: 'exact' | 'approximate' | 'regional' | 'debated';
  pointType?: 'ancient-city-site' | 'modern-city-centre' | 'archaeological-site' | 'regional-reference' | 'mobile-centre';
  confidence?: Confidence;
}

export interface BoundaryState {
  id: string;
  polityId: string;
  validFrom: number;
  validTo: number;
  snapshotYear: number;
  sourceName: string;
  sourceUrl: string;
  vertexCount: number;
  geometry: GeoJSON.Geometry;
  controlType: ControlType;
  confidence: Confidence;
  sourceIds: string[];
  notes?: string;
  temporalKind?: 'interval';
  presentation?: 'interval' | 'snapshot' | 'reference' | 'maximum';
  sourceFrom?: number;
  sourceTo?: number;
  sourceRecord?: number;
  areaKm2?: number;
  memberOf?: string;
  evidence: BoundaryEvidence;
}

export interface HistoricalEvent {
  id: string;
  year: number;
  title: string;
  summary: string;
  placeId?: string;
  sourceIds: string[];
  endYear?: number;
  datePrecision?: 'year' | 'approximate' | 'range';
  region?: 'china' | 'world';
  category?: string;
  background?: string;
  process?: string;
  impact?: string;
  mapNote?: string;
  references?: Array<{ title: string; url: string; detail?: string }>;
  verification?: 'checked' | 'partial';
  coordinates?: [number, number];
  locationPrecision?: 'approximate' | 'confirmed';
}

export interface EventParticipant {
  personId: string;
  role: string;
  note?: string;
  relationType?: 'direct' | 'contextual';
}

export interface EventPhase {
  label: string;
  startYear?: number;
  endYear?: number;
  summary: string;
}

export interface HistoricalEventDetail {
  eventId: string;
  participants: EventParticipant[];
  polityIds: string[];
  causes: string[];
  consequences: string[];
  phases?: EventPhase[];
  locationIds: string[];
  relatedEventIds: string[];
  sourceIds: string[];
  uncertaintyNote?: string;
}

export interface SourceNote {
  id: string;
  title: string;
  authorOrInstitution?: string;
  urlOrCitation?: string;
  scope: string;
  note: string;
}

export interface HistoricalState {
  year: number;
  displayLabel: string;
  activePolities: Polity[];
  boundaries: BoundaryState[];
  places: Place[];
  events: HistoricalEvent[];
  coverage: {
    mode: 'snapshot' | 'reference' | 'missing' | 'interval' | 'mixed' | 'maximum';
    snapshotYear?: number;
    missingPolityIds: string[];
    maximumCount?: number;
    intervalCount?: number;
  };
}

export interface WorldSlice {
  start: number;
  end: number;
  polities: Polity[];
  boundaries: BoundaryState[];
}

export type SelectedEntity = { type: 'polity' | 'place' | 'event'; id: string } | undefined;

export interface AppState {
  currentYear: number;
  selectedEntity: SelectedEntity;
  visibleLayers: Set<'boundaries' | 'places' | 'modernReference' | 'events'>;
  isPlaying: boolean;
}
