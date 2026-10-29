import { evaluateMapRelease, type MapReleaseCompliance } from '../compliance/map-release';
import { useLocale } from '../i18n/locale';

export function MapReleaseStatus({ compliance, releaseId }: { compliance: MapReleaseCompliance; releaseId: string }) {
  const { t } = useLocale();
  const approved = compliance.status === 'approved-for-public-release'
    && evaluateMapRelease(compliance, new Date(), undefined, releaseId).length === 0;

  return <section className="map-release-status" aria-label={t('地图公开状态')}>
    <h3>{t('地图公开状态')}</h3>
    {!approved && <p>{t(compliance.status === 'research-only'
      ? '当前版本仅供研究与内部评审，尚未公开发布。'
      : '公开发布批准信息无效或已过期，当前版本尚未公开发布。')}</p>}
    {approved && <>
      <p>{t('已获公开发布批准')}</p>
      <dl>
        <div><dt>{t('审图号')}</dt><dd>{compliance.reviewNumber}</dd></div>
        <div><dt>{t('有效期至')}</dt><dd>{compliance.reviewExpiresAt}</dd></div>
      </dl>
    </>}
  </section>;
}
