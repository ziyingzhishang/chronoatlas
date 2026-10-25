import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContentProvider, useHistoricalContent } from './ContentContext';
import { bundledContentCatalog, bundledContentManifest } from './bundled-content';
import { InMemoryContentRepository, type HistoricalContentRepository } from './repository';
import { LocaleProvider } from '../i18n/locale';

function Probe() {
  const { catalog, revision } = useHistoricalContent();
  return <p>{revision}:{catalog.people[0]?.name}</p>;
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

  it('localizes external repository loading and failure states', async () => {
    localStorage.setItem('history-locale', 'en');
    const repository: HistoricalContentRepository = { load: async () => { throw new Error('Invalid revision'); } };
    render(<LocaleProvider><ContentProvider repository={repository}><Probe /></ContentProvider></LocaleProvider>);

    expect(screen.getByRole('status')).toHaveTextContent('Loading historical content');
    expect(await screen.findByRole('alert')).toHaveTextContent('Historical content failed to load');
    localStorage.setItem('history-locale', 'zh-CN');
  });
});
