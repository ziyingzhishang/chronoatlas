import type { CityStudyView, PolityStudyView } from '../domain/study-view';
import { formatHistoricalYear } from '../domain/timeline';
import { useLocale } from '../i18n/locale';

type StudyView = CityStudyView | PolityStudyView;

export function StudyRelationsPanel({ view }: { view: StudyView }) {
  const { t } = useLocale();
  const cityView = view.kind === 'city' ? view : undefined;
  const polityView = view.kind === 'polity' ? view : undefined;

  return (
    <section className="study-relations" aria-label={t('历史关系研究视图')}>
      <div className="study-relations-heading">
        <span className="eyebrow">{t(cityView ? '城市视角' : '政权视角')}</span>
        <span className="study-year">{t('截至')} {formatHistoricalYear(view.year)}</span>
      </div>
      {cityView && <div className="study-block">
        <h3>{t('曾以此地为政治中心的政权')}</h3>
        <ul className="study-chip-list">{cityView.polities.map((polity) => <li key={polity.id}>{polity.name}</li>)}</ul>
      </div>}
      {polityView && <div className="study-block">
        <h3>{t('相关人物')}</h3>
        <ul className="study-chip-list">{polityView.people.map((person) => <li key={person.id}>{person.name}</li>)}</ul>
      </div>}
      <div className="study-block">
        <h3>{t('相关事件')}</h3>
        {view.events.length > 0 ? <ul className="study-list">{view.events.slice(-5).map((event) => <li key={event.id}><strong>{t(event.title)}</strong><span>{formatHistoricalYear(event.year)}</span></li>)}</ul> : <p className="detail-note">{t('暂无已关联事件')}</p>}
      </div>
      <div className="study-block">
        <h3>{t('遗产与城市记忆')}</h3>
        {view.heritage.length > 0 ? <ul className="study-list">{view.heritage.slice(0, 5).map((asset) => <li key={asset.id}><strong>{t(asset.name)}</strong><span>{t(asset.modernStatus === 'extant' ? '现存' : '遗址')}</span></li>)}</ul> : <p className="detail-note">{t('暂无已关联遗产')}</p>}
      </div>
    </section>
  );
}
