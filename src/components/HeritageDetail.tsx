import { events } from '../data/events';
import { heritageById } from '../data/heritage';
import { people } from '../data/people';
import { polities } from '../data/polities';
import { sourceById } from '../data/sources';
import type { HeritageDetail as HeritageDetailData, HeritagePhaseType } from '../data/heritage-details';

export interface HeritageNavigationTarget {
  type: 'person' | 'polity' | 'event';
  id: string;
}

export interface HeritageDetailProps {
  detail: HeritageDetailData;
  heritageName?: string;
  onNavigate?: (target: HeritageNavigationTarget) => void;
  onOpenEntity?: (target: HeritageNavigationTarget) => void;
}

const phaseLabels: Record<HeritagePhaseType, string> = {
  original: '原建筑',
  site: '遗址',
  reconstruction: '后世重建',
  restoration: '现代复原',
};

const fallbackLabels: Record<string, string> = {
  xuanzang: '玄奘',
  'xuanzang-translations': '玄奘取经',
};

function entityLabel(type: HeritageNavigationTarget['type'], id: string): string {
  if (fallbackLabels[id]) return fallbackLabels[id];
  if (type === 'person') return people.find((person) => person.id === id)?.name ?? id;
  if (type === 'polity') return polities.find((polity) => polity.id === id)?.name ?? id;
  return events.find((event) => event.id === id)?.title ?? id;
}

function RelatedEntityList({
  type,
  ids,
  onNavigate,
}: {
  type: HeritageNavigationTarget['type'];
  ids: string[];
  onNavigate?: (target: HeritageNavigationTarget) => void;
}) {
  if (ids.length === 0) return <p className="detail-note">暂无已关联资料</p>;
  return <ul className="heritage-related-list">
    {ids.map((id) => <li key={id}>
      {onNavigate ? <button type="button" onClick={() => onNavigate({ type, id })}>{entityLabel(type, id)}</button> : <span>{entityLabel(type, id)}</span>}
    </li>)}
  </ul>;
}

export function HeritageDetail({ detail, heritageName, onNavigate, onOpenEntity }: HeritageDetailProps) {
  const navigate = onNavigate ?? onOpenEntity;
  const name = heritageName ?? heritageById[detail.heritageId]?.name ?? detail.heritageId;

  return <article className="heritage-detail" aria-label="遗产详情">
    <header className="heritage-detail-header">
      <p className="eyebrow">遗产详情</p>
      <h2>{name}</h2>
      <p className="heritage-detail-location"><span>现代位置：</span><span>{detail.modernLocation}</span></p>
    </header>

    <section className="heritage-detail-section" aria-labelledby="heritage-history-heading">
      <h3 id="heritage-history-heading">建造沿革</h3>
      <ol className="heritage-phase-list">
        {detail.constructionHistory.map((item, index) => <li key={`${item.type}-${item.period}-${index}`} className={`heritage-phase heritage-phase-${item.type}`}>
          <div className="heritage-phase-heading"><strong>{item.label || phaseLabels[item.type]}</strong><span>{item.period}</span></div>
          <p>{item.description}</p>
          {item.sourceIds.length > 0 && <p className="detail-note heritage-phase-sources">
            <span>阶段依据：</span>
            <span>{item.sourceIds.map((sourceId) => sourceById[sourceId]?.title ?? sourceId).join('、')}</span>
          </p>}
          {item.uncertaintyNote && <p className="detail-note"><span>不确定性：</span><span>{item.uncertaintyNote}</span></p>}
        </li>)}
      </ol>
    </section>

    <section className="heritage-detail-section" aria-labelledby="heritage-associations-heading">
      <h3 id="heritage-associations-heading">历史关联</h3>
      <ul className="heritage-association-list">{detail.historicalAssociations.map((association) => <li key={association}>{association}</li>)}</ul>
    </section>

    <section className="heritage-detail-section" aria-labelledby="heritage-related-people-heading">
      <h3 id="heritage-related-people-heading">关联人物</h3>
      <RelatedEntityList type="person" ids={detail.associatedPeople} onNavigate={navigate} />
    </section>

    <section className="heritage-detail-section" aria-labelledby="heritage-related-polities-heading">
      <h3 id="heritage-related-polities-heading">关联政权</h3>
      <RelatedEntityList type="polity" ids={detail.associatedPolities} onNavigate={navigate} />
    </section>

    <section className="heritage-detail-section" aria-labelledby="heritage-related-events-heading">
      <h3 id="heritage-related-events-heading">关联事件</h3>
      <RelatedEntityList type="event" ids={detail.associatedEvents} onNavigate={navigate} />
    </section>

    <section className="heritage-detail-section" aria-labelledby="heritage-surviving-features-heading">
      <h3 id="heritage-surviving-features-heading">现存特征</h3>
      <ul className="heritage-feature-list">{detail.survivingFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>
      <p className="heritage-present-day-value">今日价值：{detail.presentDayValue}</p>
    </section>

    <section className="heritage-detail-section" aria-labelledby="heritage-evidence-heading">
      <h3 id="heritage-evidence-heading">来源与依据</h3>
      <details open>
        <summary>查看来源</summary>
        <ul className="heritage-source-list">{detail.sourceIds.map((sourceId) => {
          const source = sourceById[sourceId];
          return <li key={sourceId}><strong>{source?.title ?? sourceId}</strong>{source?.urlOrCitation && <small>{source.urlOrCitation}</small>}{source?.note && <p>{source.note}</p>}</li>;
        })}</ul>
      </details>
      <p className="detail-note"><span>不确定性：</span><span>{detail.uncertaintyNote}</span></p>
    </section>
  </article>;
}
