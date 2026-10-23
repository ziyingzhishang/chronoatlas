import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { auditKnowledgeCoverage } from '../data/knowledge-coverage';
import type { DetailEntity } from '../domain/detail-entity';
import { LocaleProvider } from '../i18n/locale';
import { KnowledgeCoveragePanel } from './KnowledgeCoveragePanel';

test('shows real coverage totals and an expandable actionable task entry', () => {
  const report = auditKnowledgeCoverage();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} /></LocaleProvider>);

  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`实体 ${report.entities.length}`);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`可行动缺口 ${report.tasks.length}`);
  const disclosure = screen.getByText('展开可行动缺口');
  expect(disclosure.tagName).toBe('SUMMARY');
  expect(screen.getByRole('link', { name: '查看完整审计 ↗' })).toHaveAttribute('href', '/data/coverage-audit.json');
});

test('opens the task subject in its existing detail drawer callback', async () => {
  const user = userEvent.setup();
  const report = auditKnowledgeCoverage();
  const task = report.tasks[0];
  const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} onOpenEntity={onOpenEntity} /></LocaleProvider>);

  await user.click(screen.getByText('展开可行动缺口'));
  const subject = screen.getByRole('button', { name: `打开实体详情：${task.subjectLabel}` });
  expect(subject).toHaveAccessibleName(`打开实体详情：${task.subjectLabel}`);
  await user.click(subject);

  expect(onOpenEntity).toHaveBeenCalledWith({ type: task.entityType, id: task.entityId });
  expect(screen.getByRole('link', { name: '查看完整审计 ↗' })).toHaveAttribute('href', '/data/coverage-audit.json');
});

test('uses the localized accessible name for an English reader', async () => {
  const user = userEvent.setup();
  localStorage.setItem('history-locale', 'en');
  const report = auditKnowledgeCoverage();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} onOpenEntity={vi.fn()} /></LocaleProvider>);

  await user.click(screen.getByText('Expand actionable gaps'));
  expect(screen.getByRole('button', { name: `Open entity details: ${report.tasks[0].subjectLabel}` })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View full audit ↗' })).toHaveAttribute('href', '/data/coverage-audit.json');
  localStorage.removeItem('history-locale');
});

test('renders a safe empty state when the report has no actionable tasks', () => {
  const report = auditKnowledgeCoverage({
    polities: [],
    people: [],
    events: [],
    eventDetails: [],
    heritageAssets: [],
    heritageDetails: [],
    personDetails: [],
    claims: [],
    sourceNotes: [],
    places: [],
  });

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} /></LocaleProvider>);

  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent('当前没有可行动缺口');
  expect(screen.queryByRole('button', { name: '展开可行动缺口' })).not.toBeInTheDocument();
});
