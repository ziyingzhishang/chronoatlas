import { useLocale } from '../i18n/locale';
import type {
  CoveragePerspective,
  CoverageTaskKind,
  KnowledgeCoverageReport,
} from '../data/knowledge-coverage';

interface KnowledgeCoveragePanelProps {
  report: KnowledgeCoverageReport;
  maxTasks?: number;
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

export function KnowledgeCoveragePanel({ report, maxTasks = 8 }: KnowledgeCoveragePanelProps) {
  const { t } = useLocale();
  const tasks = report.tasks.slice(0, maxTasks);

  return (
    <section className="knowledge-coverage-panel" data-testid="knowledge-coverage-panel" aria-labelledby="knowledge-coverage-title">
      <div className="panel-section-heading">
        <div>
          <span className="eyebrow">{t('学习覆盖')}</span>
          <h3 id="knowledge-coverage-title">{t('覆盖报告摘要')}</h3>
        </div>
        <a href="/data/coverage-audit.json" target="_blank" rel="noreferrer">{t('查看完整审计 ↗')}</a>
      </div>
      <p className="detail-note">
        {t('实体')} {report.entities.length} · {t('缺口')} {report.gaps.length} · {t('可行动缺口')} {report.tasks.length}
      </p>
      {report.tasks.length === 0 ? (
        <p className="detail-note">{t('当前没有可行动缺口')}</p>
      ) : (
        <details className="knowledge-coverage-tasks">
          <summary role="button">{t('展开可行动缺口')}</summary>
          <ul className="source-links">
            {tasks.map((task) => (
              <li key={`${task.perspective}:${task.taskKind}:${task.entityId}`}>
                <a href="/data/coverage-audit.json" target="_blank" rel="noreferrer">{t(task.subjectLabel)}</a>
                <span className="detail-note"> · {t(perspectiveLabels[task.perspective])} · {t(taskLabels[task.taskKind])}</span>
                <p className="detail-note">{t(task.note)}</p>
              </li>
            ))}
          </ul>
          {report.tasks.length > tasks.length && <p className="detail-note">{t('其余缺口请查看完整审计报告。')}</p>}
        </details>
      )}
    </section>
  );
}
