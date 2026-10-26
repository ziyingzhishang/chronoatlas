import { bundledPublicCollections } from './bundled-adapter';
import { InMemoryContentRepository, type ContentManifest } from './repository';

/**
 * Transitional typed catalog for the current build. UI and domain code can move
 * to this boundary before the backing data moves out of TypeScript modules.
 */
export const bundledContentCatalog = bundledPublicCollections;

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
