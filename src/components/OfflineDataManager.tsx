import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReleaseManifest, ReleasePackage } from '../content/release-types';
import { useLocale } from '../i18n/locale';
import { IndexedDbPackageStore } from '../offline/indexeddb-package-store';
import type { AvailablePackage } from '../offline/offline-package-manager';
import { OfflinePackageManager } from '../offline/offline-package-manager';
import type { InstalledPackage } from '../offline/package-store';
import { announceOfflineReleaseChange } from '../offline/release-events';

export interface OfflineManager {
  listAvailable(): Promise<readonly AvailablePackage[]>;
  listInstalled(): Promise<readonly InstalledPackage[]>;
  install(packageId: string): Promise<void>;
  activate(): Promise<void>;
  rollback(): Promise<void>;
  remove(packageId: string): Promise<void>;
}

interface BrowserStorageManager {
  estimate(): Promise<StorageEstimate>;
  persist?: () => Promise<boolean>;
}

export function OfflineDataManager({ manifest, manager: providedManager, storageManager: providedStorage }: {
  manifest: ReleaseManifest;
  manager?: OfflineManager;
  storageManager?: BrowserStorageManager;
}) {
  const { t } = useLocale();
  const [manager, setManager] = useState<OfflineManager | undefined>(providedManager);
  const [available, setAvailable] = useState<readonly AvailablePackage[]>([]);
  const [installed, setInstalled] = useState<readonly InstalledPackage[]>([]);
  const [busyPackage, setBusyPackage] = useState<string>();
  const [busyAction, setBusyAction] = useState<string>();
  const [message, setMessage] = useState<{ kind: 'status' | 'alert'; text: string }>();
  const storage = providedStorage ?? globalThis.navigator?.storage;
  const downloadablePackages = useMemo(() => manifest.packages.filter((releasePackage) => (
    releasePackage.files.length > 0
    && releasePackage.files.every((file) => file.uri.startsWith(`releases/${manifest.releaseId}/`))
  )), [manifest]);
  const downloadablePackageIds = useMemo(() => new Set(downloadablePackages.map((item) => item.id)), [downloadablePackages]);
  const downloadableRelease = downloadablePackages.length > 0;

  const refresh = useCallback(async (activeManager: OfflineManager) => {
    const [nextAvailable, nextInstalled] = await Promise.all([
      activeManager.listAvailable(), activeManager.listInstalled(),
    ]);
    setAvailable(nextAvailable.filter(({ releasePackage }) => downloadablePackageIds.has(releasePackage.id)));
    setInstalled(nextInstalled);
  }, [downloadablePackageIds]);

  useEffect(() => {
    let active = true;
    let close: (() => void) | undefined;
    const initialize = async () => {
      if (!downloadableRelease) return;
      try {
        let activeManager: OfflineManager;
        if (providedManager) activeManager = providedManager;
        else {
          const store = await IndexedDbPackageStore.open();
          close = () => store.close();
          await store.cleanupAbandonedStaging();
          activeManager = new OfflinePackageManager({ manifest: { ...manifest, packages: downloadablePackages }, store });
        }
        if (!active) { close?.(); return; }
        setManager(activeManager);
        await refresh(activeManager);
      } catch (error) {
        if (active) setMessage({ kind: 'alert', text: readerSafeError(error, t) });
      }
    };
    void initialize();
    return () => { active = false; close?.(); };
  }, [downloadablePackages, downloadableRelease, manifest, providedManager, refresh, t]);

  const installedByPackage = useMemo(() => {
    const values = new Map<string, InstalledPackage[]>();
    for (const item of installed) values.set(item.packageId, [...(values.get(item.packageId) ?? []), item]);
    return values;
  }, [installed]);

  async function installPackage(releasePackage: ReleasePackage) {
    if (!manager) return;
    setBusyPackage(releasePackage.id);
    setMessage(undefined);
    try {
      const requiredBytes = installBytes(manifest, releasePackage.id, new Set(available.filter((item) => item.installed).map((item) => item.releasePackage.id)));
      if (storage) {
        const estimate = await storage.estimate();
        if (estimate.quota !== undefined && estimate.usage !== undefined && estimate.quota - estimate.usage < requiredBytes) {
          setMessage({ kind: 'alert', text: t('存储空间不足，无法安装所选历史资料包。') });
          return;
        }
      }
      await manager.install(releasePackage.id);
      await refresh(manager);
      if (!storage?.persist) {
        setMessage({ kind: 'status', text: t('资料已安装；浏览器不支持申请持久存储，系统仍可能自动清理。') });
      } else if (await storage.persist()) {
        setMessage({ kind: 'status', text: t('资料已安装，浏览器已授予持久存储。') });
      } else {
        setMessage({ kind: 'status', text: t('资料已安装，但浏览器未授予持久存储。') });
      }
    } catch (error) {
      setMessage({ kind: 'alert', text: readerSafeError(error, t) });
    } finally {
      setBusyPackage(undefined);
    }
  }

  async function runAction(label: 'activate' | 'rollback' | 'remove', action: () => Promise<void>) {
    setBusyAction(label);
    setMessage(undefined);
    try {
      await action();
      const releaseChanged = label === 'activate' || label === 'rollback';
      if (releaseChanged) announceOfflineReleaseChange();
      try {
        if (manager) await refresh(manager);
      } catch {
        setMessage({ kind: 'alert', text: t(releaseChanged
          ? '版本已切换，但离线资料列表刷新失败。'
          : '操作已完成，但离线资料列表刷新失败。') });
        return;
      }
      setMessage({ kind: 'status', text: t('离线资料状态已更新。') });
    } catch (error) {
      setMessage({ kind: 'alert', text: readerSafeError(error, t) });
    } finally {
      setBusyAction(undefined);
    }
  }

  return <section className="offline-data-manager" aria-labelledby="offline-data-title">
    <header>
      <h3 id="offline-data-title">{t('离线历史资料')}</h3>
      <p>{t('按资料包下载后，可在无网络时继续阅读已安装的历史内容。在线地形和卫星底图在离线时可能不可用。')}</p>
    </header>
    {!downloadableRelease && <>
      <p className="offline-unavailable-note">{t('当前内置资料尚未发布为可下载离线包。完成版本发布后，可在此安装并管理离线资料。')}</p>
      <p className="offline-storage-note">{t('当前内容仍可在线阅读；在线地形和卫星底图不属于离线资料包。')}</p>
    </>}
    {downloadableRelease && <>
    {!manager && !message && <p role="status">{t('正在读取离线资料…')}</p>}
    <div className="offline-package-list">
      {available.map(({ releasePackage }) => {
        const prior = installedByPackage.get(releasePackage.id) ?? [];
        const installedCurrent = prior.some((item) => item.releaseId === manifest.releaseId);
        const hasOlder = !installedCurrent && prior.length > 0;
        const installing = busyPackage === releasePackage.id;
        return <article className="offline-package-card" aria-label={t(packageLabel(releasePackage))} key={releasePackage.id}>
          <div className="offline-package-summary">
            <h4>{t(packageLabel(releasePackage))}</h4>
            <dl>
              <div><dt>{t('版本')}</dt><dd>{manifest.releaseId}</dd></div>
              <div><dt>{t('下载大小')}</dt><dd>{formatBytes(releasePackage.compressedBytes)}</dd></div>
              <div><dt>{t('许可')}</dt><dd>{releasePackage.licenseIds.join('、')}</dd></div>
              <div><dt>{t('状态')}</dt><dd>{t(installedCurrent ? '已安装' : hasOlder ? '有可用更新' : '未安装')}</dd></div>
            </dl>
          </div>
          {installing && <div className="offline-install-progress" role="progressbar" aria-label={t('安装进度')} aria-valuetext={t('正在校验并安装')}>{t('正在校验并安装…')}</div>}
          <div className="offline-package-actions">
            {!installedCurrent && <button type="button" disabled={Boolean(busyPackage || busyAction)} onClick={() => void installPackage(releasePackage)}>{t(hasOlder ? '更新' : '安装')}</button>}
            {installedCurrent && <button type="button" disabled={Boolean(busyPackage || busyAction)} onClick={() => void runAction('remove', () => manager!.remove(releasePackage.id))}>{t('移除')}</button>}
          </div>
        </article>;
      })}
    </div>
    <div className="offline-release-actions">
      <button type="button" disabled={!manager || Boolean(busyPackage || busyAction)} onClick={() => void runAction('activate', () => manager!.activate())}>{t('启用已安装版本')}</button>
      <button type="button" disabled={!manager || Boolean(busyPackage || busyAction)} onClick={() => void runAction('rollback', () => manager!.rollback())}>{t('回退到上一版本')}</button>
    </div>
    <p className="offline-storage-note">{t('安装前会检查浏览器可用空间；即使申请了持久存储，也请保留原始资料来源。')}</p>
    {message && <p role={message.kind}>{t(message.text)}</p>}
    </>}
  </section>;
}

function packageLabel(releasePackage: ReleasePackage) {
  if (releasePackage.id === 'core-zh') return '中文核心历史资料';
  if (releasePackage.id === 'china-territory') return '中国疆域资料';
  if (releasePackage.kind === 'world') return '同期世界资料';
  if (releasePackage.kind === 'media') return '多媒体资料';
  return '历史资料包';
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

function installBytes(manifest: ReleaseManifest, packageId: string, installed: Set<string>) {
  const visited = new Set<string>();
  const visit = (id: string): number => {
    if (visited.has(id) || installed.has(id)) return 0;
    visited.add(id);
    const releasePackage = manifest.packages.find((item) => item.id === id);
    if (!releasePackage) return 0;
    return releasePackage.files.reduce((sum, file) => sum + file.bytes, 0)
      + releasePackage.dependencies.reduce((sum, dependency) => sum + visit(dependency), 0);
  };
  return visit(packageId);
}

function readerSafeError(error: unknown, t: (key: string) => string) {
  const message = error instanceof Error ? error.message : String(error);
  if (/sha-?256|checksum|digest|integrity|hash|校验/i.test(message)) {
    return t('资料校验失败，已保留当前版本。');
  }
  return t('离线资料操作失败，当前版本未改变。');
}
