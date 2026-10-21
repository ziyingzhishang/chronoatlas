import { useLocale } from '../i18n/locale';
import type { HistoricalState, SelectedEntity } from '../domain/types';
import { InfoPanel } from './InfoPanel';
import type { DetailEntity } from '../domain/detail-entity';

interface DirectoryPopoverProps {
  id?: string;
  state: HistoricalState;
  selectedEntity: SelectedEntity;
  onSelectEntity: (entity: Exclude<SelectedEntity, undefined>) => void;
  onBackToDirectory: () => void;
  onClose: () => void;
  onYearChange?: (year: number) => void;
  onOpenEntity?: (entity: DetailEntity) => void;
}

export function DirectoryPopover({ id, state, selectedEntity, onSelectEntity, onBackToDirectory, onClose, onYearChange, onOpenEntity }: DirectoryPopoverProps) {
  const { t } = useLocale();
  return <aside id={id} className="directory-popover" aria-label={t('政权目录')}>
    <div className="directory-popover-heading">
      <strong>{t('政权目录')}</strong>
      <button type="button" aria-label={t('收起')} onClick={onClose}>×</button>
    </div>
    {selectedEntity ? <>
      <button className="directory-back" type="button" onClick={onBackToDirectory}>← {t('返回目录')}</button>
      <InfoPanel state={state} selectedEntity={selectedEntity} onYearChange={onYearChange} onOpenEntity={onOpenEntity} />
    </> : <div className="directory-popover-scroll">
      <section className="directory-section">
        <span className="eyebrow">{t('本年政权目录')}</span>
        <div className="directory-list">
          {state.activePolities.map(polity => <button type="button" key={polity.id} onClick={() => onSelectEntity({ type: 'polity', id: polity.id })}>
            <span className="directory-dot" style={{ backgroundColor: polity.color }} />
            <span>{t(polity.name)}</span>
            <small>{t(polity.region === 'world' ? '同期世界' : '中国历史')}</small>
          </button>)}
          {!state.activePolities.length && <p className="detail-note">{t('暂无已收录政权')}</p>}
        </div>
      </section>
      <section className="directory-section">
        <span className="eyebrow">{t('地点目录 · 点击定位')}</span>
        <div className="directory-list">
          {state.places.map(place => <button type="button" key={place.id} onClick={() => onSelectEntity({ type: 'place', id: place.id })}>
            <span>{t(place.historicalName)}</span>
            <small>{t(place.modernName ?? '未标注')}</small>
          </button>)}
          {!state.places.length && <p className="detail-note">{t('暂无已收录地点')}</p>}
        </div>
      </section>
    </div>}
  </aside>;
}
