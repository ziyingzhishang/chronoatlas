import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { auditKnowledgeCoverage } from '../data/knowledge-coverage';
import { LocaleProvider } from '../i18n/locale';
import { KnowledgeCoveragePanel } from './KnowledgeCoveragePanel';

test('shows real coverage totals and an expandable actionable task entry', () => {
  const report = auditKnowledgeCoverage();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} /></LocaleProvider>);

  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`实体 ${report.entities.length}`);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`可行动缺口 ${report.tasks.length}`);
  const disclosure = screen.getByText('展开可行动缺口');
  expect(disclosure.tagName).toBe('SUMMARY');
  expect(screen.getByRole('link', { name: report.tasks[0].subjectLabel })).toHaveAttribute('href', '/data/coverage-audit.json');
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
