export type DetailEntity =
  | { type: 'polity'; id: string }
  | { type: 'place'; id: string }
  | { type: 'person'; id: string }
  | { type: 'event'; id: string }
  | { type: 'heritage'; id: string };

export interface DetailHistoryEntry {
  entity: DetailEntity;
  title: string;
}
