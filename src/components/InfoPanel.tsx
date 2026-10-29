import { useLocale } from '../i18n/locale';
import type { BoundaryState, HistoricalState, SelectedEntity } from '../domain/types';
import { formatHistoricalYear } from '../domain/timeline';
import { boundaryStatusLabel } from '../map/presentation';
import { buildCityStudyView, buildPolityStudyView } from '../domain/study-view';
import { StudyRelationsPanel } from './StudyRelationsPanel';
import type { DetailEntity } from '../domain/detail-entity';
import { PolityDetail } from './PolityDetail';
import { useHistoricalContent } from '../content/ContentContext';
import type { Polity } from '../domain/types';
import { ReaderNotes } from './ReaderNotes';
import { toReaderSources } from '../presentation/reader-content';

interface InfoPanelProps {
  state: HistoricalState;
  selectedEntity: SelectedEntity;
  onYearChange?: (year:number)=>void;
  onOpenEntity?: (entity: DetailEntity) => void;
  polityDetailMode?: 'summary' | 'drawer';
}

const controlLabels = {
  direct: '直接控制',
  indirect: '间接控制',
  disputed: '争议范围',
  influence: '影响范围',
  unspecified: '原始资料未细分控制类型',
} as const;

const range = (from:number,to:number) => from===to ? formatHistoricalYear(from) : `${formatHistoricalYear(from)}—${formatHistoricalYear(to)}`;
const uniquePolities = (items: readonly Polity[]) => [...new Map(items.map((polity) => [polity.id, polity])).values()];

function boundaryExpressionNote(boundary: BoundaryState) {
  if (boundary.presentation === 'maximum') return '此范围仅用于说明资料中的较大范围，不代表所选年份的实际控制。';
  if (boundary.evidence.derivation === 'cultural-core') return '地图表达的是文化核心，不是政权边界。';
  if (boundary.evidence.derivation === 'control-centers') return '地图仅表达可核实的控制中心，不推定连续疆域。';
  if (boundary.evidence.derivation === 'influence-area') return '地图表达影响范围，不等同于直接统治。';
  return '边界依据该时段资料绘制，不代表逐年测绘或每一处边界都能精确确定。';
}

export function InfoPanel({ state, selectedEntity, onYearChange, onOpenEntity, polityDetailMode = 'summary' }: InfoPanelProps) {
  const { locale, t } = useLocale();
  const { catalog, historySource } = useHistoricalContent();
  const { capitalTerms, claims, eventDetails, events, studyEvents: polityStudyEvents, heritage, heritageDetails, people, personDetails, places, polities, polityDetails, sources, mappingNotes, sovereigntyNotices } = catalog;
  const cityStudyEvents = polityStudyEvents;
  const prose = (value:string) => locale==='en' && /[\u3400-\u9fff]/.test(value) && t(value)===value
    ? 'Verification note retained in the Chinese data record; consult the linked source for details.' : t(value);
  const listSeparator=locale==='en' ? ', ' : '、';
  const allPolities = uniquePolities([...polities, ...state.activePolities]);
  const mappingNoteByPolity = new Map(mappingNotes.map((note) => [note.id, note.note]));
  const boundariesForSelectedPolity = selectedEntity?.type === 'polity'
    ? historySource.boundaries.filter((boundary) => boundary.polityId === selectedEntity.id)
    : [];
  const selected = selectedEntity ? selectedEntity.type==='polity' ? allPolities.find(p=>p.id===selectedEntity.id) : selectedEntity.type==='place' ? state.places.find(p=>p.id===selectedEntity.id) : state.events.find(e=>e.id===selectedEntity.id) : undefined;
  const capital = selected && 'capitalPlaceId' in selected && selected.capitalPlaceId ? state.places.find(place=>place.id===selected.capitalPlaceId) : undefined;
  const activeCapitalTerms = capitalTerms.filter((record) => record.validFrom <= state.year && record.validTo >= state.year);
  const currentCapitalTerms = selected && 'name' in selected ? activeCapitalTerms.filter((record) => record.polityId === selected.id) : [];
  const selectedPlaceCapitalTerms = selected && 'historicalName' in selected ? activeCapitalTerms.filter(record=>record.placeId===selected.id) : [];
  const studyView = selectedEntity?.type === 'polity'
    ? buildPolityStudyView(selectedEntity.id, state.year, { polities: allPolities, places, people, heritage, events: polityStudyEvents, eventDetails, claims, capitalTerms, polityDetails })
    : selectedEntity?.type === 'place'
      ? buildCityStudyView(selectedEntity.id, state.year, { polities: allPolities, places, people, heritage, events: cityStudyEvents, eventDetails, claims, capitalTerms })
      : undefined;
  const selectedPolityDetail = selectedEntity?.type === 'polity' ? polityDetails.find((detail) => detail.polityId === selectedEntity.id) : undefined;

  return (
    <aside className="info-panel" aria-label={t("历史信息")}>
      <div className="panel-kicker">{state.displayLabel}</div>
      {!selected && (
        <>
          <h2>{t("本年政权目录")}</h2>
          <p className="panel-intro">{t("年表记录与疆域资料分别呈现。未着色不代表无人居住或无政权，只表示本版缺少适用的边界资料。")}</p>
          <ul className="polity-list">
            {state.activePolities.filter(p=>p.region!=='world').map((polity) => (
              <li key={polity.id}>
                <span className="polity-dot" style={{ backgroundColor: polity.color }} />
                <span>{polity.name}</span>
                <span className="polity-type">{t(state.boundaries.find(boundary=>boundary.polityId===polity.id) ? boundaryStatusLabel(state.boundaries.find(boundary=>boundary.polityId===polity.id)!) : '暂无国家边界资料')}</span>
              </li>
            ))}
          </ul>
          {state.events.length > 0 && (
            <div className="event-summary">
              <span className="eyebrow">{t("本年事件")}</span>
              {state.events.map((event) => <p key={event.id}>
                {onOpenEntity ? <button type="button" onClick={() => onOpenEntity({ type: 'event', id: event.id })}>{t(event.title)}</button> : t(event.title)}
                {locale==='en'?': ':'：'}{t(event.summary)}
              </p>)}
            </div>
          )}
          {!state.activePolities.length && <p className="detail-note">{t("史前时期展示文化分期，不虚构统一政权或明确国界。")}</p>}
          <p className="uncertainty-note">{t("每年按来源区间查询。最大参考用虚线区分，不等于该年的实际控制范围。世界目录可在地图下方搜索并定位。")}</p>
        </>
      )}
      {selectedEntity?.type === 'place' && selected && 'historicalName' in selected && (
        <>
          <span className="eyebrow">{t("历史地域")}</span>
          <h2>{t(selected.historicalName)}</h2>
          {selected.aliases.length > 0 && <p className="aliases">{t("又称：")}{selected.aliases.join(listSeparator)}</p>}
          <dl className="detail-list">
            <dt>{t("现代位置")}</dt>
            <dd>{t(selected.modernName ?? '暂无对应名称')}</dd>
            <dt>{t("现代行政参照")}</dt>
            <dd>{t(selected.modernAdministrativeUnit ?? '暂无')}</dd>
            {selectedPlaceCapitalTerms.length > 0 && <>
              <dt>{t("政权角色")}</dt>
              <dd>{selectedPlaceCapitalTerms.map(record => `${t(record.role==='primary'?'首都':record.role==='secondary'?'陪都／副都':record.role==='mobile_court'?'移动政治中心':'政治中心')} · ${t(record.status==='uncertain'?'待核验':'已核验')}`).join(listSeparator)}</dd>
            </>}
          </dl>
          {selected.notes && <p className="detail-note">{t(selected.notes)}</p>}
          <p className="detail-note">{t("此处为精选古地名参照，尚未逐年校勘更名与归属；名称不保证适用于所选年的每个时点。")}</p>
          {studyView && <StudyRelationsPanel view={studyView} onOpenEntity={onOpenEntity} />}
        </>
      )}
      {selectedEntity?.type === 'polity' && selected && 'name' in selected && (
        <>
          <span className="eyebrow">{t("历史政权")}</span>
          <h2>{selected.name}</h2>
          <p className="panel-intro">{t(selected.description)}</p>
          {selectedPolityDetail && <PolityDetail detail={selectedPolityDetail} mode={polityDetailMode} onOpenEntity={onOpenEntity} />}
          {sovereigntyNotices.filter((notice) => notice.polityId === selected.id && state.year >= notice.effectiveFrom).map(notice => <section className="sovereignty-notice" data-testid="taiwan-sovereignty-notice" key={notice.id}>
            <h3>{t(notice.title)}</h3>
            <p>{t(notice.statement)}</p>
            <p className="detail-note">{t(notice.modernReferenceNote)}</p>
            <ul className="source-links">{notice.citations.map(citation => <li key={citation.title}><a href={citation.urlOrCitation} target="_blank" rel="noreferrer">{t(citation.title)}</a></li>)}</ul>
          </section>)}
          {selected.localizedName?.sourceName && <p className="aliases">{t("来源原名：")}{selected.localizedName.sourceName}</p>}
          <dl className="detail-list">
            <dt>{t(selected.region==='world'?'来源观测范围':'存续范围')}</dt>
            <dd>{t(formatHistoricalYear(selected.startYear))}{t("至")}{t(formatHistoricalYear(selected.endYear))}</dd>
            <dt>{t("当前都城／政治中心")}</dt>
            <dd>{currentCapitalTerms.length > 0 ? currentCapitalTerms.map(record => {
              const place = state.places.find(item=>item.id===record.placeId);
              return `${t(place?.historicalName ?? '相关地点')}${place?.modernName ? `（${t('今·')}${t(place.modernName)}）` : ''}`;
            }).join(listSeparator) : t(capital && 'historicalName' in capital ? capital.historicalName : '未标注')}</dd>
            <dt>{t("首都沿革")}</dt>
            <dd>{currentCapitalTerms.length > 0 ? currentCapitalTerms.map(record => `${t(formatHistoricalYear(record.validFrom))}—${t(formatHistoricalYear(record.validTo))}`).join(listSeparator) : t("暂无已核验沿革")}</dd>
            <dt>{t("当前状态")}</dt>
            <dd>{state.boundaries.filter((boundary) => boundary.polityId === selected.id).map((boundary) => t(controlLabels[boundary.controlType])).join(listSeparator) || t('暂无疆域几何')}</dd>
          </dl>
          {state.boundaries.filter(b => b.polityId === selected.id).map(b => <ReaderNotes key={b.id} className="boundary-source" note={{
            dateDescription: range(b.validFrom, b.validTo),
            uncertainty: [boundaryExpressionNote(b), b.evidence.uncertaintyNote, b.notes, b.memberOf ? `${b.memberOf}，不等于直接管辖。` : undefined].filter(Boolean).map((note) => prose(note!)).join('；'),
            sources: b.evidence.citations.map((citation) => ({ title: citation.title, citation: [citation.version, citation.pageOrRecord].filter(Boolean).join(' · ') || undefined, url: citation.urlOrCitation })),
          }} />)}
          {mappingNoteByPolity.get(selected.id) && <ReaderNotes note={{ uncertainty: prose(mappingNoteByPolity.get(selected.id)!), sources: toReaderSources(selected.sourceIds, sources) }} />}
          {onYearChange && boundariesForSelectedPolity.length > 0 && <details className="boundary-history"><summary>{t("本政权的资料变化 · 点击比较")}</summary><p>{t("以下是数据分段，不是全部历史变化。相邻段也可能沿用同一几何。")}</p><div>
            {boundariesForSelectedPolity.filter(b=>b.temporalKind==='interval').map(b=><button key={b.id} onClick={()=>onYearChange(b.validFrom)}>{t(range(b.validFrom,b.validTo))}</button>)}
          </div></details>}
          <ReaderNotes note={{
            uncertainty: selected.sourceIds.map((id) => sources.find((source) => source.id === id)?.note).filter(Boolean).map((note) => prose(note!)).join('；') || undefined,
            sources: toReaderSources(selected.sourceIds, sources),
          }} />
          {studyView && <StudyRelationsPanel view={studyView} onOpenEntity={onOpenEntity} />}
        </>
      )}
      {selectedEntity?.type === 'event' && selected && 'title' in selected && (
        <>
          <span className="eyebrow">{t("编年事件")}</span>
          <h2>{t(selected.title)}</h2>
          <p className="panel-intro">{t(selected.summary)}</p>
          {onOpenEntity && <button type="button" onClick={() => onOpenEntity({ type: 'event', id: selected.id })}>{t('打开完整事件详情')}</button>}
        </>
      )}
    </aside>
  );
}
