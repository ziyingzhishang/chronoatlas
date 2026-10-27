import { useHistoricalContent } from '../content/ContentContext';
import { useLocale } from '../i18n/locale';

type KnowledgeCoverageContext =
  | { type: 'polity'; id: string }
  | { type: 'city'; id: string };

interface KnowledgeCoveragePanelProps {
  context?: KnowledgeCoverageContext;
}

/**
 * Reader-safe overview of the active release. Detailed coverage audits, task
 * identifiers and unresolved evidence references belong to authoring tools and
 * are deliberately not accepted by this component.
 */
export function KnowledgeCoveragePanel({ context }: KnowledgeCoveragePanelProps) {
  const { t } = useLocale();
  const { catalog } = useHistoricalContent();
  const perspective = context?.type ?? 'global';
  const contextId = context?.id ?? 'global';
  const summary = catalog.knowledgeCoverageSummaries.find((item) => (
    item.perspective === perspective && item.contextId === contextId
  )) ?? catalog.knowledgeCoverageSummaries.find((item) => item.perspective === 'global');

  if (!summary) return null;

  return (
    <section className="knowledge-coverage-panel" data-testid="knowledge-coverage-panel" aria-labelledby="knowledge-coverage-title">
      <div className="panel-section-heading">
        <div>
          <span className="eyebrow">{t('资料概览')}</span>
          <h3 id="knowledge-coverage-title">{t(summary.label)}</h3>
        </div>
      </div>
      <p>{t(summary.summary)}</p>
      <p className="detail-note">{t('已关联历史对象')} {summary.entityCount}</p>
      <details>
        <summary>{t('资料说明')}</summary>
        <p className="detail-note">{t('此处概述当前可阅读资料；更详细的来源与不确定性可在各条目的资料说明中查看。')}</p>
      </details>
    </section>
  );
}
