import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { auditKnowledgeCoverage } from '../data/knowledge-coverage';
import type { DetailEntity } from '../domain/detail-entity';
import { LocaleProvider } from '../i18n/locale';
import { KnowledgeCoveragePanel } from './KnowledgeCoveragePanel';

const assetUrl = vi.hoisted(() => vi.fn((path:string) => `/chronoatlas/${path}`));
vi.mock('../runtime/asset-url', () => ({ publicAssetUrl: assetUrl }));

test('shows real coverage totals and the closed-task empty state', () => {
  const report = auditKnowledgeCoverage();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} /></LocaleProvider>);

  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`实体 ${report.entities.length}`);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`可行动缺口 ${report.tasks.length}`);
  expect(report.tasks).toHaveLength(0);
  expect(screen.getByText('当前没有可行动缺口')).toBeInTheDocument();
  expect(screen.queryByText('展开可行动缺口')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: '查看完整审计 ↗' })).toHaveAttribute('href', '/chronoatlas/data/knowledge-coverage.json');
});

test('keeps the detail drawer callback idle when the audit has no actionable task', async () => {
  const report = auditKnowledgeCoverage();
  const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} onOpenEntity={onOpenEntity} /></LocaleProvider>);

  expect(report.tasks).toHaveLength(0);
  expect(screen.queryByRole('button', { name: /打开实体详情：/ })).not.toBeInTheDocument();
  expect(onOpenEntity).not.toHaveBeenCalled();
  expect(screen.getByRole('link', { name: '查看完整审计 ↗' })).toHaveAttribute('href', '/chronoatlas/data/knowledge-coverage.json');
});

test('uses the localized empty state for an English reader', async () => {
  localStorage.setItem('history-locale', 'en');
  const report = auditKnowledgeCoverage();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} onOpenEntity={vi.fn()} /></LocaleProvider>);

  expect(report.tasks).toHaveLength(0);
  expect(screen.getByText('There are currently no actionable gaps')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View full audit ↗' })).toHaveAttribute('href', '/chronoatlas/data/knowledge-coverage.json');
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

test('shows capital-only city coverage instead of implying the city is complete', () => {
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
    places: [{
      id: 'capital-only-place',
      historicalName: '首都候选城',
      aliases: [],
      modernName: '今首都候选城',
      longitude: 0,
      latitude: 0,
      sourceIds: [],
    }],
    capitalTerms: [{
      polityId: 'unknown-polity',
      placeId: 'capital-only-place',
      validFrom: 1,
      validTo: 10,
      role: 'primary',
      status: 'formal',
      confidence: 'high',
      sourceIds: [],
    }],
  });

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} context={{ type: 'city', id: 'capital-only-place' }} /></LocaleProvider>);

  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent('首都／政治中心时段');
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent('尚无关联知识节点');
  expect(screen.getByTestId('knowledge-coverage-panel')).not.toHaveTextContent('学习闭环已覆盖');
});

test('falls back to the global report when a contextual index is unavailable', () => {
  const report = auditKnowledgeCoverage();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} context={{ type: 'city', id: 'missing-place' }} /></LocaleProvider>);

  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`实体 ${report.entities.length}`);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`可行动缺口 ${report.tasks.length}`);
});

test('shows expandable gap details with entity, dimension, status, and note', async () => {
  const user = userEvent.setup();
  const report = auditKnowledgeCoverage();
  const gap = report.gaps[0];

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} /></LocaleProvider>);

  await user.click(screen.getByText('展开缺口明细'));

  expect(screen.getByTestId('knowledge-coverage-gaps')).toHaveTextContent(gap.label);
  expect(screen.getByTestId('knowledge-coverage-gaps')).toHaveTextContent(gap.entityType === 'polity' ? '覆盖实体：政权' : gap.entityType === 'person' ? '覆盖实体：人物' : gap.entityType === 'event' ? '覆盖实体：事件' : '覆盖实体：遗产');
  expect(screen.getByTestId('knowledge-coverage-gaps')).toHaveTextContent(gap.dimension === 'summary' ? '覆盖维度：摘要' : gap.dimension === 'detail' ? '覆盖维度：详情' : gap.dimension === 'source' ? '覆盖维度：来源' : gap.dimension === 'relationship' ? '覆盖维度：关系' : '覆盖维度：时间');
  expect(screen.getByTestId('knowledge-coverage-gaps')).toHaveTextContent(gap.kind === 'uncertain' ? '待复核' : gap.kind === 'data-missing' ? '待补' : gap.kind === 'relationship-missing' ? '关系待补' : '来源待补');
  expect(screen.getByTestId('knowledge-coverage-gaps')).toHaveTextContent(gap.note);
});

test('opens a gap entity from the details and keeps uncertainty distinct from actionable tasks', async () => {
  const user = userEvent.setup();
  const report = auditKnowledgeCoverage();
  const gap = report.gaps[0];
  const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} onOpenEntity={onOpenEntity} /></LocaleProvider>);

  await user.click(screen.getByText('展开缺口明细'));
  await user.click(screen.getByRole('button', { name: `打开缺口实体：${gap.label}` }));
  expect(onOpenEntity).toHaveBeenCalledWith({ type: gap.entityType, id: gap.entityId });

  const uncertainGap = report.gaps.find((candidate) => candidate.kind === 'uncertain');
  if (uncertainGap) {
    expect(screen.getByTestId('knowledge-coverage-gaps')).toHaveTextContent('待复核');
    expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`可行动缺口 ${report.tasks.length}`);
  }
  expect(screen.queryByText('不适用')).not.toBeInTheDocument();
});

test('filters gap details to the selected context while leaving actionable tasks unchanged', async () => {
  const user = userEvent.setup();
  const report = auditKnowledgeCoverage();
  const [polityId, polityReport] = Object.entries(report.byPolity).find(([, item]) => item.gaps.length > 0)!;
  const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} context={{ type: 'polity', id: polityId }} onOpenEntity={onOpenEntity} /></LocaleProvider>);

  await user.click(screen.getByText('展开缺口明细'));
  expect(screen.getByTestId('knowledge-coverage-gaps')).toHaveTextContent(polityReport.gaps[0].label);
  expect(screen.getByTestId('knowledge-coverage-panel')).toHaveTextContent(`可行动缺口 ${report.tasks.filter((task) => task.polityIds.includes(polityId)).length}`);
});

test('traces gap evidence and related IDs to source or entity entry points', async () => {
  const user = userEvent.setup();
  const baseReport = auditKnowledgeCoverage();
  const traceGap = {
    ...baseReport.gaps[0],
    evidenceIds: ['claim-han-changan-capital', 'zizhi-tongjian', 'unknown-evidence-id'],
    relatedIds: ['liu-bang', 'changan-han-capital', 'han-changan-city-site'],
  };
  const report = { ...baseReport, gaps: [traceGap] };
  const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} onOpenEntity={onOpenEntity} /></LocaleProvider>);

  await user.click(screen.getByText('展开缺口明细'));
  const gaps = screen.getByTestId('knowledge-coverage-gaps');
  expect(gaps).toHaveTextContent('证据 ID：claim-han-changan-capital');
  expect(gaps).toHaveTextContent('来源：zizhi-tongjian');
  expect(gaps).toHaveTextContent('未解析：unknown-evidence-id');
  expect(gaps).toHaveTextContent('关联 ID：liu-bang');
  expect(gaps).toHaveTextContent('关联 ID：changan-han-capital');
  expect(gaps).toHaveTextContent('关联 ID：han-changan-city-site');

  await user.click(screen.getByRole('button', { name: '打开证据实体：claim-han-changan-capital' }));
  expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: 'han_western' });
  await user.click(screen.getByRole('button', { name: '打开关联实体：liu-bang' }));
  expect(onOpenEntity).toHaveBeenCalledWith({ type: 'person', id: 'liu-bang' });
  await user.click(screen.getByRole('button', { name: '打开关联实体：changan-han-capital' }));
  expect(onOpenEntity).toHaveBeenCalledWith({ type: 'event', id: 'changan-han-capital' });
  await user.click(screen.getByRole('button', { name: '打开关联实体：han-changan-city-site' }));
  expect(onOpenEntity).toHaveBeenCalledWith({ type: 'heritage', id: 'han-changan-city-site' });
});

test('keeps unresolved trace IDs explicit and source citations accessible without a drawer callback', async () => {
  const user = userEvent.setup();
  const baseReport = auditKnowledgeCoverage();
  const report = {
    ...baseReport,
    gaps: [{
      ...baseReport.gaps[0],
      evidenceIds: ['zizhi-tongjian-vol1-three-jin', 'unresolved-source'],
      relatedIds: ['unresolved-related'],
    }],
  };

  render(<LocaleProvider><KnowledgeCoveragePanel report={report} /></LocaleProvider>);

  await user.click(screen.getByText('展开缺口明细'));
  const gaps = screen.getByTestId('knowledge-coverage-gaps');
  expect(gaps).toHaveTextContent('来源：zizhi-tongjian-vol1-three-jin');
  expect(gaps).toHaveTextContent('未解析：unresolved-source');
  expect(gaps).toHaveTextContent('未解析：unresolved-related');
  expect(screen.getByRole('link', { name: '查看来源：zizhi-tongjian-vol1-three-jin' })).toHaveAttribute('href', 'https://ctext.org/wiki.pl?chapter=648120&if=gb');
});
