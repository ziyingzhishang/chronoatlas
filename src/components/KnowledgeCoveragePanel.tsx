import { useLocale } from '../i18n/locale';
import type { DetailEntity } from '../domain/detail-entity';
import type {
  CoveragePerspective,
  CoverageTaskKind,
  KnowledgeCoverageGap,
  KnowledgeCoverageReport,
} from '../data/knowledge-coverage';

type KnowledgeCoverageContext =
  | { type: 'polity'; id: string }
  | { type: 'city'; id: string };

interface KnowledgeCoveragePanelProps {
  report: KnowledgeCoverageReport;
  maxTasks?: number;
  onOpenEntity?: (entity: DetailEntity) => void;
  context?: KnowledgeCoverageContext;
}

const taskLabels: Record<CoverageTaskKind, string> = {
  'polity-heritage-missing': '政权缺少遗产关联',
  'person-person-relationship-missing': '人物关系待补',
  'event-participant-missing': '事件参与人物待补',
  'event-location-missing': '事件地点待补',
  'relationship-missing': '关系证据待补',
};

const perspectiveLabels: Record<CoveragePerspective, string> = {
  polity: '政权视角',
  city: '城市视角',
};

const gapEntityTypeLabels: Record<KnowledgeCoverageGap['entityType'], string> = {
  polity: '覆盖实体：政权',
  person: '覆盖实体：人物',
  event: '覆盖实体：事件',
  heritage: '覆盖实体：遗产',
};

const gapDimensionLabels: Record<KnowledgeCoverageGap['dimension'], string> = {
  summary: '覆盖维度：摘要',
  detail: '覆盖维度：详情',
  source: '覆盖维度：来源',
  relationship: '覆盖维度：关系',
  time: '覆盖维度：时间',
};

const gapStatusLabels: Record<KnowledgeCoverageGap['kind'], string> = {
  'data-missing': '待补',
  'relationship-missing': '关系待补',
  'source-missing': '来源待补',
  uncertain: '待复核',
};

export function KnowledgeCoveragePanel({ report, maxTasks = 8, onOpenEntity, context }: KnowledgeCoveragePanelProps) {
  const { t } = useLocale();
  const contextualReport = context
    ? context.type === 'polity' ? report.byPolity[context.id] : report.byCity[context.id]
    : undefined;
  const contextTasks = contextualReport && context
    ? report.tasks.filter((task) => context.type === 'polity'
      ? task.polityIds.includes(context.id)
      : task.placeIds.includes(context.id))
    : report.tasks;
  const gaps = contextualReport?.gaps ?? report.gaps;
  const tasks = contextTasks.slice(0, maxTasks);
  const entityCount = contextualReport?.entityKeys.length ?? report.entities.length;
  const gapCount = contextualReport?.gaps.length ?? report.gaps.length;
  const reportName = contextualReport
    ? 'polityName' in contextualReport ? contextualReport.polityName : contextualReport.cityName
    : undefined;
  const perspective = context?.type === 'polity' ? '政权视角' : context?.type === 'city' ? '城市视角' : undefined;

  return (
    <section className="knowledge-coverage-panel" data-testid="knowledge-coverage-panel" aria-labelledby="knowledge-coverage-title">
      <div className="panel-section-heading">
        <div>
          <span className="eyebrow">{t('学习覆盖')}</span>
          <h3 id="knowledge-coverage-title">
            {contextualReport ? <>{t(perspective!)} · {t(reportName!)}</> : t('覆盖报告摘要')}
          </h3>
        </div>
        <a href="/data/coverage-audit.json" target="_blank" rel="noreferrer">{t('查看完整审计 ↗')}</a>
      </div>
      <p className="detail-note">
        {t('实体')} {entityCount} · {t('缺口')} {gapCount} · {t('可行动缺口')} {contextualReport ? contextTasks.length : report.tasks.length}
      </p>
      {contextTasks.length === 0 ? (
        <p className="detail-note">{t('当前没有可行动缺口')}</p>
      ) : (
        <details className="knowledge-coverage-tasks">
          <summary role="button">{t('展开可行动缺口')}</summary>
          <ul className="source-links">
            {tasks.map((task) => (
              <li key={`${task.perspective}:${task.taskKind}:${task.entityId}`}>
                {onOpenEntity ? (
                  <button
                    type="button"
                    aria-label={`${t('打开实体详情：')}${t(task.subjectLabel)}`}
                    onClick={() => onOpenEntity({ type: task.entityType, id: task.entityId })}
                  >
                    {t(task.subjectLabel)}
                  </button>
                ) : (
                  <a href="/data/coverage-audit.json" target="_blank" rel="noreferrer">{t(task.subjectLabel)}</a>
                )}
                <span className="detail-note"> · {t(perspectiveLabels[task.perspective])} · {t(taskLabels[task.taskKind])}</span>
                <p className="detail-note">{t(task.note)}</p>
              </li>
            ))}
          </ul>
          {contextTasks.length > tasks.length && <p className="detail-note">{t('其余缺口请查看完整审计报告。')}</p>}
        </details>
      )}
      {gaps.length > 0 && (
        <details className="knowledge-coverage-gaps">
          <summary role="button">{t('展开缺口明细')}</summary>
          <ul className="source-links" data-testid="knowledge-coverage-gaps">
            {gaps.map((gap) => (
              <li key={`${gap.entityKey}:${gap.dimension}:${gap.kind}`}>
                {onOpenEntity ? (
                  <button
                    type="button"
                    aria-label={`${t('打开缺口实体：')}${t(gap.label)}`}
                    onClick={() => onOpenEntity({ type: gap.entityType, id: gap.entityId })}
                  >
                    {t(gap.label)}
                  </button>
                ) : (
                  <a href="/data/coverage-audit.json" target="_blank" rel="noreferrer">{t(gap.label)}</a>
                )}
                <span className="detail-note"> · {t(gapEntityTypeLabels[gap.entityType])} · {t(gapDimensionLabels[gap.dimension])} · {t(gapStatusLabels[gap.kind])}</span>
                <p className="detail-note">{t('说明：')}{t(gap.note)}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
