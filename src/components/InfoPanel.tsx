import { useLocale } from '../i18n/locale';
import type { HistoricalState, SelectedEntity } from '../domain/types';
import { sourceById } from '../data/sources';
import { formatHistoricalYear } from '../domain/timeline';
import { boundariesByPolity } from '../data/boundaries';
import { mappingNotes } from '../data/cliopatria-mapping';
import { formatSourceField } from '../i18n/source-display';
import { sovereigntyNoticesFor } from '../data/sovereignty';
import { boundaryStatusLabel } from '../map/presentation';
import { activeCapitalRecords } from '../data/capital-history';
import { capitalHistory } from '../data/capital-history';
import { claims } from '../data/claims';
import { events as historicalEvents } from '../data/events';
import { eventDetails } from '../data/event-details';
import { changanEvents } from '../data/changan-study';
import { heritageAssets } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { buildCityStudyView, buildPolityStudyView } from '../domain/study-view';
import { StudyRelationsPanel } from './StudyRelationsPanel';
import type { DetailEntity } from '../domain/detail-entity';
import { getPolityDetail, polityDetails } from '../data/polity-details';
import { PolityDetail } from './PolityDetail';

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
const sourceYear = (year:number) => year===0 ? '0（来源边界值，非公元0年）' : formatHistoricalYear(year);
const sourceRange = (from:number,to:number) => from===to ? sourceYear(from) : `${sourceYear(from)}—${sourceYear(to)}`;
const polityStudyEvents = [...historicalEvents, ...changanEvents].filter((event, index, all) => all.findIndex((candidate) => candidate.id === event.id) === index);
const cityStudyEvents = polityStudyEvents;

export function InfoPanel({ state, selectedEntity, onYearChange, onOpenEntity, polityDetailMode = 'summary' }: InfoPanelProps) {
  const { locale, t } = useLocale();
  const prose = (value:string) => locale==='en' && /[\u3400-\u9fff]/.test(value) && t(value)===value
    ? 'Verification note retained in the Chinese data record; consult the linked source for details.' : t(value);
  const listSeparator=locale==='en' ? ', ' : '、';
  const selected = selectedEntity ? selectedEntity.type==='polity' ? state.activePolities.find(p=>p.id===selectedEntity.id) : selectedEntity.type==='place' ? state.places.find(p=>p.id===selectedEntity.id) : state.events.find(e=>e.id===selectedEntity.id) : undefined;
  const capital = selected && 'capitalPlaceId' in selected && selected.capitalPlaceId ? state.places.find(place=>place.id===selected.capitalPlaceId) : undefined;
  const currentCapitalTerms = selected && 'name' in selected ? activeCapitalRecords(state.year, selected.id) : [];
  const selectedPlaceCapitalTerms = selected && 'historicalName' in selected ? activeCapitalRecords(state.year).filter(record=>record.placeId===selected.id) : [];
  const studyView = selectedEntity?.type === 'polity'
    ? buildPolityStudyView(selectedEntity.id, state.year, { polities, places, people, heritage: heritageAssets, events: polityStudyEvents, eventDetails, claims, capitalTerms: capitalHistory, polityDetails })
    : selectedEntity?.type === 'place'
      ? buildCityStudyView(selectedEntity.id, state.year, { polities, places, people, heritage: heritageAssets, events: cityStudyEvents, claims, capitalTerms: capitalHistory })
      : undefined;
  const sourceField=(kind:Parameters<typeof formatSourceField>[0],value:string)=>formatSourceField(kind,value,locale);

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
              {state.events.map((event) => <p key={event.id}>{event.title}{locale==='en'?': ':'：'}{event.summary}</p>)}
            </div>
          )}
          {!state.activePolities.length && <p className="detail-note">{t("史前时期展示文化分期，不虚构统一政权或明确国界。")}</p>}
          <p className="uncertainty-note">{t("每年按来源区间查询。最大参考用虚线区分，不等于该年的实际控制范围。世界目录可在地图下方搜索并定位。")}</p>
          <a href="/data/coverage-audit.json" target="_blank" rel="noreferrer">{t("逐政权覆盖、缺年与核验备注 ↗")}</a>
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
            <dt>{t("坐标")}</dt>
            <dd>{selected.latitude.toFixed(2)}°N{locale==='en'?', ':'，'}{selected.longitude.toFixed(2)}°E</dd>
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
          {getPolityDetail(selected.id) && <PolityDetail detail={getPolityDetail(selected.id)!} mode={polityDetailMode} onOpenEntity={onOpenEntity} />}
          {sovereigntyNoticesFor(state.year, selected.id).map(notice => <section className="sovereignty-notice" data-testid="taiwan-sovereignty-notice" key={notice.id}>
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
              return `${t(place?.historicalName ?? record.placeId)}${place?.modernName ? `（${t('今·')}${t(place.modernName)}）` : ''}`;
            }).join(listSeparator) : t(capital && 'historicalName' in capital ? capital.historicalName : '未标注')}</dd>
            <dt>{t("首都沿革")}</dt>
            <dd>{currentCapitalTerms.length > 0 ? currentCapitalTerms.map(record => `${t(formatHistoricalYear(record.validFrom))}—${t(formatHistoricalYear(record.validTo))}`).join(listSeparator) : t("暂无已核验沿革")}</dd>
            <dt>{t("当前状态")}</dt>
            <dd>{state.boundaries.filter((boundary) => boundary.polityId === selected.id).map((boundary) => t(controlLabels[boundary.controlType])).join(listSeparator) || t('暂无疆域几何')}</dd>
          </dl>
          {state.boundaries.filter(b => b.polityId === selected.id).map(b => <details className="boundary-source" data-testid="boundary-evidence" key={b.id}>
            <summary><strong>{t(b.presentation==='maximum' ? '最大范围参考 · 非本年实况' : b.temporalKind==='interval' ? '按来源时段查询 · 非逐年考证' : '同年资料断面')}</strong><span>{t('证据级别：')}{b.evidence.evidenceLevel} · {t(range(b.validFrom,b.validTo))}</span></summary>
            <div className="boundary-source-body"><p>{t('证据级别：')}{b.evidence.evidenceLevel}</p>
            <p>{t('派生方式：')}{t({
              'direct-source':'直接来源', 'licensed-digitization':'数字化参考', 'nearest-same-polity':'过渡参考',
              'maximum-record':'最大参考', 'administrative-synthesis':'行政区综合', 'cultural-core':'文化核心',
              'control-centers':'控制中心', 'influence-area':'影响范围',
            }[b.evidence.derivation])}</p>
            <p>{t('复核状态：')}{t(b.evidence.reviewStatus==='pending'?'待逐段复核':b.evidence.reviewStatus==='cross-checked'?'已交叉复核':'已核对来源')}</p>
            <p>{t("适用时段：")}{t(range(b.validFrom,b.validTo))}</p>
            {b.sourceFrom!==undefined && b.sourceTo!==undefined && <p>{t("来源原始时段：")}{t(sourceRange(b.sourceFrom,b.sourceTo))}</p>}
            {b.areaKm2!==undefined && <p>{t("来源模型面积约")} {(b.areaKm2/10000).toFixed(1)} {t("万平方公里")}{t(b.presentation==='maximum'?'（已收录单条记录最大值）':'')}</p>}
            <p>{b.vertexCount.toLocaleString()} {t("个原始坐标点")} · {sourceField('sourceName',b.sourceName).label}{sourceField('sourceName',b.sourceName).value}</p>
            {b.memberOf && <p>{sourceField('membership',b.memberOf).label}{sourceField('membership',b.memberOf).value}{t("（不等于直接管辖）")}</p>}
            {b.notes && <p>{prose(b.notes)}</p>}
            <ul className="source-links">{b.evidence.citations.map(citation=><li key={`${b.id}-${citation.title}-${citation.pageOrRecord??''}`}><a href={citation.urlOrCitation} target="_blank" rel="noreferrer">{t(citation.title)}{citation.version?` · ${citation.version}`:''}{citation.pageOrRecord?` · ${prose(citation.pageOrRecord)}`:''}</a></li>)}</ul>
            <a href={b.sourceUrl} target="_blank" rel="noreferrer">{t("查看原始矢量来源 ↗")}</a>
            </div></details>)}
          {mappingNotes[selected.id] && <p className="detail-note">{t("核验备注：")}{prose(mappingNotes[selected.id])}</p>}
          {onYearChange && !!boundariesByPolity.get(selected.id)?.length && <details className="boundary-history"><summary>{t("本政权的资料变化 · 点击比较")}</summary><p>{t("以下是数据分段，不是全部历史变化。相邻段也可能沿用同一几何。")}</p><div>
            {boundariesByPolity.get(selected.id)?.filter(b=>b.temporalKind==='interval').map(b=><button key={b.id} onClick={()=>onYearChange(b.validFrom)}>{t(range(b.validFrom,b.validTo))}{t(b.areaKm2 ? ` · 约${(b.areaKm2/10000).toFixed(0)}万 km²` : '')}</button>)}
          </div></details>}
          {selected.sourceIds.map(id => sourceById[id]).filter(Boolean).map(s => {const field=sourceField('documentTitle',s.title);return <p className="detail-note" key={s.id}>{field.label}{field.value} · {prose(s.note)}</p>;})}
          {studyView && <StudyRelationsPanel view={studyView} onOpenEntity={onOpenEntity} />}
        </>
      )}
      {selectedEntity?.type === 'event' && selected && 'title' in selected && (
        <>
          <span className="eyebrow">{t("编年事件")}</span>
          <h2>{t(selected.title)}</h2>
          <p className="panel-intro">{t(selected.summary)}</p>
        </>
      )}
    </aside>
  );
}
