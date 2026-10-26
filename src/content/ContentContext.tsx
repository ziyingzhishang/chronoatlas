import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  bundledContentCatalog,
  bundledContentManifest,
  bundledContentRepository,
  bundledHistoricalSnapshot,
  bundledReleaseManifest,
  type BundledContentCatalog,
} from './bundled-content';
import {
  validateContentCollections,
  type ContentCollections,
  type HistoricalContentRepository,
  type ReleaseSnapshotRepository,
} from './repository';
import { InMemoryHistoricalSnapshot, type HistoricalSnapshot } from './snapshot';
import type { ReleaseManifest } from './release-types';
import { useLocale } from '../i18n/locale';

interface ContentContextValue {
  catalog: BundledContentCatalog;
  revision: string;
  external: boolean;
  snapshot: HistoricalSnapshot;
  release: ReleaseManifest;
}

export type ContentState =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; value: ContentContextValue; snapshot: HistoricalSnapshot; release: ReleaseManifest };

const bundledValue: ContentContextValue = {
  catalog: bundledContentCatalog,
  revision: bundledContentManifest.revision,
  external: false,
  snapshot: bundledHistoricalSnapshot,
  release: bundledReleaseManifest,
};

const ContentContext = createContext<ContentContextValue>(bundledValue);

export function ContentProvider({ children, repository }: {
  children: ReactNode;
  repository?: HistoricalContentRepository | ReleaseSnapshotRepository;
}) {
  const { t } = useLocale();
  const activeRepository = repository ?? bundledContentRepository;
  const usesBundledRepository = activeRepository === bundledContentRepository;
  const [state, setState] = useState<ContentState>(usesBundledRepository
    ? { status: 'ready', value: bundledValue, snapshot: bundledHistoricalSnapshot, release: bundledReleaseManifest }
    : { status: 'loading' });

  useEffect(() => {
    let active = true;
    if (usesBundledRepository) {
      setState({ status: 'ready', value: bundledValue, snapshot: bundledHistoricalSnapshot, release: bundledReleaseManifest });
      return () => { active = false; };
    }
    setState({ status: 'loading' });
    loadRepository(activeRepository).then((value) => {
      if (active) setState({ status: 'ready', value, snapshot: value.snapshot, release: value.release });
    }).catch((reason: unknown) => {
      if (active) setState({ status: 'error', error: reason instanceof Error ? reason : new Error(String(reason)) });
    });
    return () => { active = false; };
  }, [activeRepository, usesBundledRepository]);

  const stableValue = useMemo(() => state.status === 'ready' ? state.value : undefined, [state]);
  if (state.status === 'loading') return <main className="content-load-state" role="status">{t('正在加载历史内容…')}</main>;
  if (state.status === 'error') return <main className="content-load-state content-load-error" role="alert"><h1>{t('历史内容加载失败')}</h1><p>{state.error.message}</p></main>;
  return <ContentContext.Provider value={stableValue!}><div className="content-provider" data-content-revision={state.value.revision}>{children}</div></ContentContext.Provider>;
}

async function loadRepository(repository: HistoricalContentRepository | ReleaseSnapshotRepository): Promise<ContentContextValue> {
  if ('open' in repository) {
    const snapshot = await repository.open();
    const entries = await Promise.all(Object.keys(bundledContentCatalog).map(async (name) => [name, await snapshot.getCollection(name)] as const));
    const collections: ContentCollections = Object.fromEntries(entries);
    validateContentCollections(collections);
    if (!isBundledCatalog(collections)) throw new Error('Release snapshot does not provide the complete reader catalog');
    return { catalog: collections, revision: snapshot.release.releaseId, external: true, snapshot, release: snapshot.release };
  }

  const legacy = await repository.load();
  const missing = Object.keys(bundledContentCatalog).filter((name) => !Array.isArray(legacy.collections[name]));
  if (missing.length) throw new Error(`Content snapshot is missing collections: ${missing.join(', ')}`);
  validateContentCollections(legacy.collections);
  if (!isBundledCatalog(legacy.collections)) throw new Error('Content snapshot does not provide the complete reader catalog');
  const release = legacyRelease(legacy.manifest.revision);
  const snapshot = new InMemoryHistoricalSnapshot(release, legacy.collections);
  return { catalog: legacy.collections, revision: legacy.manifest.revision, external: true, snapshot, release };
}

function isBundledCatalog(collections: ContentCollections): collections is BundledContentCatalog {
  return Object.keys(bundledContentCatalog).every((name) => Array.isArray(collections[name]));
}

function legacyRelease(revision: string): ReleaseManifest {
  return { ...bundledReleaseManifest, releaseId: /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(revision) ? revision : 'legacy-external' };
}

export function useHistoricalContent() {
  return useContext(ContentContext);
}
