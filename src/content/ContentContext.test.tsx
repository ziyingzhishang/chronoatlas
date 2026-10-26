import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContentProvider, useHistoricalContent } from './ContentContext';
import { bundledContentCatalog, bundledContentManifest, bundledReleaseManifest } from './bundled-content';
import { InMemoryContentRepository, type HistoricalContentRepository } from './repository';
import { InMemoryHistoricalSnapshot } from './snapshot';
import { LocaleProvider } from '../i18n/locale';

function Probe() {
  const { catalog, revision } = useHistoricalContent();
  return <p>{revision}:{catalog.people[0]?.name}</p>;
}

function ReaderProbe() {
  return <p>读者正文</p>;
}

function ReleaseProbe() {
  const { release, snapshot } = useHistoricalContent();
  return <p>{release.releaseId}:{snapshot.release.releaseId}</p>;
}

describe('ContentProvider', () => {
  it('publishes a repository snapshot to consumers without changing component imports', async () => {
    const repository = new InMemoryContentRepository(
      { ...bundledContentManifest, revision: 'database-snapshot-7' },
      { ...bundledContentCatalog, people: [{ ...bundledContentCatalog.people[0], name: '仓储注入人物' }] },
    );
    render(<ContentProvider repository={repository}><Probe /></ContentProvider>);

    const probe = await screen.findByText('database-snapshot-7:仓储注入人物');
    expect(probe).toBeInTheDocument();
    expect(probe.parentElement).toHaveAttribute('data-content-revision', 'database-snapshot-7');
  });

  it('does not silently publish bundled content when an external repository fails', async () => {
    const repository: HistoricalContentRepository = { load: async () => { throw new Error('版本校验失败'); } };
    render(<ContentProvider repository={repository}><Probe /></ContentProvider>);

    expect(screen.getByRole('status')).toHaveTextContent('正在加载历史内容');
    expect(await screen.findByRole('alert')).toHaveTextContent('历史内容加载失败');
    expect(screen.getByRole('alert')).toHaveTextContent('版本校验失败');
    expect(screen.queryByText(/bundled-initial/)).not.toBeInTheDocument();
  });

  it('publishes one fixed release snapshot and its validated reader catalog', async () => {
    const release = { ...bundledReleaseManifest, releaseId: 'release-context' };
    const snapshot = new InMemoryHistoricalSnapshot(release, {
      ...bundledContentCatalog,
      people: [{ ...bundledContentCatalog.people[0], name: '版本化人物' }],
    }, { boundaries: [], coverageConclusions: [] });
    const repository = { open: async () => snapshot };
    render(<ContentProvider repository={repository}><><Probe /><ReleaseProbe /></></ContentProvider>);

    expect(await screen.findByText('release-context:版本化人物')).toBeInTheDocument();
    expect(screen.getByText('release-context:release-context')).toBeInTheDocument();
  });

  it('fails closed before publishing a release with malformed map boundaries', async () => {
    const release = { ...bundledReleaseManifest, releaseId: 'malformed-map-release' };
    const snapshot = new InMemoryHistoricalSnapshot(release, bundledContentCatalog, {
      boundaries: [{
        id: 'bad-boundary', polityId: 'qin', validFrom: -221, validTo: -207, snapshotYear: -221,
        geometry: { type: 'Point', coordinates: [Number.NaN, 34] }, controlType: 'direct',
        sourceIds: [], mapRepresentation: 'direct-boundary', evidence: { citations: [], uncertaintyNote: '' },
      }],
      coverageConclusions: [],
    });

    render(<ContentProvider repository={{ open: async () => snapshot }}><Probe /></ContentProvider>);

    expect(await screen.findByRole('alert')).toHaveTextContent('Release boundary collection is malformed');
    expect(screen.queryByText(/malformed-map-release:/)).not.toBeInTheDocument();
  });

  it('rejects internal evidence enums instead of trusting incompatible release values', async () => {
    const release = { ...bundledReleaseManifest, releaseId: 'invalid-evidence-release' };
    const snapshot = new InMemoryHistoricalSnapshot(release, bundledContentCatalog, {
      boundaries: [{
        id: 'bad-evidence', polityId: 'qin', validFrom: -221, validTo: -207, snapshotYear: -221,
        geometry: { type: 'Point', coordinates: [108, 34] }, controlType: 'direct', confidence: 'high',
        sourceIds: [], mapRepresentation: 'direct-boundary',
        evidence: { evidenceLevel: 'X', derivation: 'invented', reviewStatus: 'approved', citations: [], uncertaintyNote: '' },
      }],
      coverageConclusions: [],
    });

    render(<ContentProvider repository={{ open: async () => snapshot }}><Probe /></ContentProvider>);

    expect(await screen.findByRole('alert')).toHaveTextContent('Release boundary collection is malformed');
    expect(screen.queryByText(/invalid-evidence-release:/)).not.toBeInTheDocument();
  });

  it('localizes external repository loading and failure states', async () => {
    localStorage.setItem('history-locale', 'en');
    const repository: HistoricalContentRepository = { load: async () => { throw new Error('Invalid revision'); } };
    render(<LocaleProvider><ContentProvider repository={repository}><Probe /></ContentProvider></LocaleProvider>);

    expect(screen.getByRole('status')).toHaveTextContent('Loading historical content');
    expect(await screen.findByRole('alert')).toHaveTextContent('Historical content failed to load');
    localStorage.setItem('history-locale', 'zh-CN');
  });

  it('keeps the content revision available to the application without rendering it to readers', () => {
    const { container } = render(<ContentProvider><ReaderProbe /></ContentProvider>);

    expect(screen.getByText('读者正文').parentElement).toHaveAttribute('data-content-revision', bundledContentManifest.revision);
    expect(container).not.toHaveTextContent(bundledContentManifest.revision);
    expect(screen.queryByLabelText('内容版本')).not.toBeInTheDocument();
  });
});
