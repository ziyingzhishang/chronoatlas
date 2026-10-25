import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { bundledContentCatalog, bundledContentManifest, bundledContentRepository, type BundledContentCatalog } from './bundled-content';
import type { HistoricalContentRepository } from './repository';
import { useLocale } from '../i18n/locale';

interface ContentContextValue {
  catalog: BundledContentCatalog;
  revision: string;
  external: boolean;
}

const ContentContext = createContext<ContentContextValue>({
  catalog: bundledContentCatalog,
  revision: 'bundled-initial',
  external: false,
});

export function ContentProvider({
  children,
  repository,
}: {
  children: ReactNode;
  repository?: HistoricalContentRepository;
}) {
  const { t } = useLocale();
  const activeRepository = repository ?? bundledContentRepository;
  const usesBundledRepository = activeRepository === bundledContentRepository;
  const [state, setState] = useState<{ status: 'loading' } | { status: 'ready'; value: ContentContextValue } | { status: 'error'; error: Error }>(
    usesBundledRepository
      ? { status: 'ready', value: { catalog: bundledContentCatalog, revision: bundledContentManifest.revision, external: false } }
      : { status: 'loading' },
  );

  useEffect(() => {
    let active = true;
    if (!usesBundledRepository) setState({ status: 'loading' });
    activeRepository.load().then((snapshot) => {
      if (!active) return;
      const requiredCollections = Object.keys(bundledContentCatalog);
      const missing = requiredCollections.filter((name) => !Array.isArray(snapshot.collections[name]));
      if (missing.length) throw new Error(`Content snapshot is missing collections: ${missing.join(', ')}`);
      setState({ status: 'ready', value: {
          catalog: snapshot.collections as unknown as BundledContentCatalog,
          revision: snapshot.manifest.revision,
          external: !usesBundledRepository,
        } });
    }).catch((reason: unknown) => {
      if (!active) return;
      setState({ status: 'error', error: reason instanceof Error ? reason : new Error(String(reason)) });
    });
    return () => { active = false; };
  }, [activeRepository, usesBundledRepository]);

  const stableValue = useMemo(() => state.status === 'ready' ? state.value : undefined, [state]);
  if (state.status === 'loading') return <main className="content-load-state" role="status">{t('正在加载历史内容…')}</main>;
  if (state.status === 'error') return <main className="content-load-state content-load-error" role="alert"><h1>{t('历史内容加载失败')}</h1><p>{state.error.message}</p></main>;
  return <ContentContext.Provider value={stableValue!}><div className="content-provider" data-content-revision={state.value.revision}>{children}<output className="content-revision" aria-label={t('内容版本')}>{state.value.revision}</output></div></ContentContext.Provider>;
}

export function useHistoricalContent() {
  return useContext(ContentContext);
}
