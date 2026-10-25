import { capitalHistory } from '../data/capital-history';
import { changanEvents } from '../data/changan-study';
import { claims } from '../data/claims';
import { eventDetails } from '../data/event-details';
import { events } from '../data/events';
import { heritageAssets } from '../data/heritage';
import { heritageDetails } from '../data/heritage-details';
import { people } from '../data/people';
import { personDetails } from '../data/person-details';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { polityDetails } from '../data/polity-details';
import { sourceNotes } from '../data/sources';
import { eventTimeReview } from '../data/event-time-review';
import { InMemoryContentRepository, type ContentManifest } from './repository';

const allEvents = [...events, ...changanEvents.filter((event) => !events.some((catalogEvent) => catalogEvent.id === event.id))];

/**
 * Transitional typed catalog for the current build. UI and domain code can move
 * to this boundary before the backing data moves out of TypeScript modules.
 */
export const bundledContentCatalog = {
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

export type BundledContentCatalog = typeof bundledContentCatalog;

export const bundledContentManifest: ContentManifest = {
  schemaVersion: 1,
  revision: 'bundled-2026-10-24',
  collections: Object.fromEntries(Object.keys(bundledContentCatalog).map((name) => [name, `memory://${name}`])),
  media: [],
};

export const bundledContentRepository = new InMemoryContentRepository(
  bundledContentManifest,
  bundledContentCatalog,
);
