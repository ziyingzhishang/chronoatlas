import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ContentProvider } from '../content/ContentContext';
import { bundledContentCatalog, bundledContentManifest } from '../content/bundled-content';
import { InMemoryContentRepository } from '../content/repository';
import { LocaleProvider } from '../i18n/locale';
import { KnowledgeCoveragePanel } from './KnowledgeCoveragePanel';

test('renders the reader-safe overview from the active catalog', () => {
  const summary = bundledContentCatalog.knowledgeCoverageSummaries.find((item) => item.perspective === 'global')!;

  render(<LocaleProvider><KnowledgeCoveragePanel /></LocaleProvider>);

  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(summary.label);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(summary.summary);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`已关联历史对象 ${summary.entityCount}`);
});

test('switches atomically to a reader summary supplied by an external release', async () => {
  const externalSummary = {
    id: 'global', perspective: 'global', contextId: 'global', label: '外部资料概览',
    entityCount: 3, summary: '这是固定版本提供的读者摘要。',
  };
  const repository = new InMemoryContentRepository(
    { ...bundledContentManifest, revision: 'reader-summary-release' },
    { ...bundledContentCatalog, knowledgeCoverageSummaries: [externalSummary] },
  );

  render(<LocaleProvider><ContentProvider repository={repository}><KnowledgeCoveragePanel /></ContentProvider></LocaleProvider>);

  expect(await screen.findByText('这是固定版本提供的读者摘要。')).toBeInTheDocument();
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent('已关联历史对象 3');
});

test('does not expose authoring audit links, identifiers or unresolved states', () => {
  render(<LocaleProvider><KnowledgeCoveragePanel /></LocaleProvider>);

  const panel = screen.getByTestId('knowledge-coverage-panel');
  expect(panel).not.toHaveTextContent(/查看完整审计|证据 ID|来源 ID|未解析|claim-|reviewStatus|bundled-/);
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByText('资料说明')).toBeInTheDocument();
});

test('keeps the reader summary readable and free of audit terms in English', () => {
  localStorage.setItem('history-locale', 'en');
  render(<LocaleProvider><KnowledgeCoveragePanel /></LocaleProvider>);

  const panel = screen.getByTestId('knowledge-coverage-panel');
  expect(panel).toHaveTextContent('Learning materials overview');
  expect(panel).toHaveTextContent(/This release links \d+ historical subjects/);
  expect(panel).not.toHaveTextContent(/audit ID|claim-|reviewStatus|bundled-/);
  localStorage.removeItem('history-locale');
});

test('selects a polity summary without showing its internal context identifier', () => {
  const summary = bundledContentCatalog.knowledgeCoverageSummaries.find((item) => item.perspective === 'polity')!;

  render(<LocaleProvider><KnowledgeCoveragePanel context={{ type: 'polity', id: summary.contextId }} /></LocaleProvider>);

  const panel = screen.getByTestId('knowledge-coverage-panel');
  expect(panel).toHaveTextContent(summary.label);
  expect(panel).toHaveTextContent(summary.summary);
  expect(panel).not.toHaveTextContent(summary.id);
});

test('falls back to the global reader summary when a context has no release entry', () => {
  const summary = bundledContentCatalog.knowledgeCoverageSummaries.find((item) => item.perspective === 'global')!;

  render(<LocaleProvider><KnowledgeCoveragePanel context={{ type: 'city', id: 'not-in-release' }} /></LocaleProvider>);

  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(summary.summary);
});
