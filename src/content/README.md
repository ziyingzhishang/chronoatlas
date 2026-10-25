# Historical content boundary

This directory is the migration boundary between application code and historical content.

- `bundled-content.ts` exposes the current TypeScript catalogs through one transitional catalog and repository. Components should depend on this boundary instead of adding new direct imports from many `src/data/*` modules.
- `repository.ts` defines a versioned manifest contract. `InMemoryContentRepository` serves the current build; `ManifestContentRepository` can load exported database collections without changing consumers. Both validate collection-specific scalar, enum, list and nested-record fields, and reject malformed records or duplicate identities before publishing a snapshot.
- `ContentContext.tsx` loads the repository snapshot once and injects it into the application and central detail views. External repositories are fail-closed: loading and validation failures render an explicit state instead of silently mixing in bundled content. The active revision is exposed on the provider boundary.
- Entity metadata, temporal claims, source records and editorial status belong in database-backed collections.
- Territory research tasks, year-by-year conclusions, supersession links, historical/cartographic reviewers, rights review and publication review also belong in database-backed collections. `src/data/territory-research.ts` is the current in-memory migration boundary; it must never be bundled into the reader-facing map payload.
- Images, audio, video, documents and large map overlays belong in file/object storage. The database or manifest stores their URI, media type, credit, license and source reference; binary content must not be embedded in UI modules.
- GeoJSON, scanned-page locators, research attachments and generated cartographic assets belong in file/object storage. A geometry asset is publishable only through an accepted, version-linked territory decision with valid source, rights and publication reviews; the runtime map reads that accepted release artifact, not the research queue.
- A published manifest revision is the atomic content version. Unsupported schema versions, incomplete collection sets and invalid records fail before partial content is displayed. Editorial time-review entries travel with the same snapshot so entity facts and review conclusions cannot drift across revisions.

The next migration step is to move one collection at a time from `src/data` to database exports or an API, keeping the manifest revision and all collection files as one release unit. Historical boundary geometry remains a separately audited map-data pipeline and must not be inferred from narrative content.
