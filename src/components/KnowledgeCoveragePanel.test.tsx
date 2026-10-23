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

test('shows the selected polity coverage summary and only its actionable tasks', async () => {
  const user = userEvent.setup();
  const report = auditKnowledgeCoverage();
  const [polityId, polityReport] = Object.entries(report.byPolity).find(([, item]) => item.entityKeys.length > 0)!;
  const scopedTasks = report.tasks.filter((task) => task.polityIds.includes(polityId));
  const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} context={{ type: 'polity', id: polityId }} onOpenEntity={onOpenEntity} /></LocaleProvider>);

  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`政权视角 · ${polityReport.polityName}`);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`实体 ${polityReport.entityKeys.length}`);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`缺口 ${polityReport.gaps.length}`);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`可行动缺口 ${scopedTasks.length}`);

  if (scopedTasks.length > 0) {
    await user.click(screen.getByText('展开可行动缺口'));
    expect(screen.getByRole('button', { name: `打开实体详情：${scopedTasks[0].subjectLabel}` })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: `打开实体详情：${scopedTasks[0].subjectLabel}` }));
    expect(onOpenEntity).toHaveBeenCalledWith({ type: scopedTasks[0].entityType, id: scopedTasks[0].entityId });
  }
});

test('shows the selected city coverage summary and reuses the entity drawer callback for its tasks', async () => {
  const user = userEvent.setup();
  const report = auditKnowledgeCoverage();
  const [cityId, cityReport] = Object.entries(report.byCity).find(([, item]) => item.entityKeys.length > 0)!;
  const scopedTasks = report.tasks.filter((task) => task.placeIds.includes(cityId));
  const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} context={{ type: 'city', id: cityId }} onOpenEntity={onOpenEntity} /></LocaleProvider>);

  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`城市视角 · ${cityReport.cityName}`);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`实体 ${cityReport.entityKeys.length}`);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`缺口 ${cityReport.gaps.length}`);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`可行动缺口 ${scopedTasks.length}`);
  if (scopedTasks.length === 0) {
    expect(screen.getByText('当前没有可行动缺口')).toBeInTheDocument();
    return;
  }
  await user.click(screen.getByText('展开可行动缺口'));
  await user.click(screen.getByRole('button', { name: `打开实体详情：${scopedTasks[0].subjectLabel}` }));
  expect(onOpenEntity).toHaveBeenCalledWith({ type: scopedTasks[0].entityType, id: scopedTasks[0].entityId });
});

test('falls back to the global report when a contextual index is unavailable', () => {
  const report = auditKnowledgeCoverage();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} context={{ type: 'city', id: 'missing-place' }} /></LocaleProvider>);

  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`实体 ${report.entities.length}`);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`可行动缺口 ${report.tasks.length}`);
});
