import { boundaryCatalog } from '../data/boundaries';
import { capitalHistory } from '../data/capital-history';
import { changanEvents } from '../data/changan-study';
import { claims } from '../data/claims';
import { coverageDecisions } from '../data/coverage-decisions';
import { eventDetails } from '../data/event-details';
import { events } from '../data/events';
import { eventTimeReview } from '../data/event-time-review';
import { heritageAssets } from '../data/heritage';
import { heritageDetails } from '../data/heritage-details';
import { people } from '../data/people';
import { personDetails } from '../data/person-details';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { polityDetails } from '../data/polity-details';
import { sourceNotes } from '../data/sources';
import worldManifest from '../../public/data/cliopatria-manifest.json';

const allEvents = [
  ...events,
  ...changanEvents.filter((event) => !events.some((catalogEvent) => catalogEvent.id === event.id)),
];

/**
 * Temporary authoring adapter. Export/build code consumes this single boundary
 * until a future database exporter replaces the TypeScript catalogs.
 */
export const bundledPublicCollections = {
  polities,
  places,
  people,
  events,
  studyEvents: allEvents,
  claims,
  heritage: heritageAssets,
  capitalTerms: capitalHistory,
  personDetails,
  eventDetails,
  heritageDetails,
  polityDetails,
  sources: sourceNotes,
  eventTimeReviews: eventTimeReview,
} as const;

export const bundledAuthoringSnapshot = {
  coreCollections: bundledPublicCollections,
  territory: {
    boundaries: boundaryCatalog,
    coverageDecisions,
  },
  worldChunks: worldManifest.chunks,
} as const;
