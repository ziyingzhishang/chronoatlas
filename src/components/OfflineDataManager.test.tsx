import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ReleaseManifest } from '../content/release-types';
import { OfflineDataManager, type OfflineManager } from './OfflineDataManager';
import { OFFLINE_RELEASE_CHANGE_EVENT } from '../offline/release-events';

const manifest: ReleaseManifest = {
  releaseId: '2026.10.27', schemaVersion: '1', minimumAppVersion: '0.1.0',
  createdAt: '2026-10-27T00:00:00Z', channel: 'stable', complianceProfile: 'offline-public',
  packages: [{
    id: 'core-zh', kind: 'content', required: true, dependencies: [], compressedBytes: 2048,
    recordCount: 20, licenseIds: ['MIT', 'CC-BY-4.0'], files: [{
      uri: 'releases/2026.10.27/core-zh.json', mediaType: 'application/json', sha256: 'a'.repeat(64),
      bytes: 4096, collection: 'core-zh', sourceDigest: 'b'.repeat(64),
    }],
  }],
};

function manager(overrides: Partial<OfflineManager> = {}): OfflineManager {
  return {
    listAvailable: vi.fn().mockResolvedValue([{ releasePackage: manifest.packages[0], installed: false }]),
    listInstalled: vi.fn().mockResolvedValue([]),
    install: vi.fn().mockResolvedValue(undefined),
    activate: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('OfflineDataManager', () => {
  it('offers release-owned world slices as installable packages', async () => {
    const world = {
      id: 'world-ce-100', kind: 'world', region: 'world', yearRange: [100, 199],
      required: false, dependencies: ['core-zh'], compressedBytes: 512, recordCount: 2,
      licenseIds: ['CC-BY-4.0'], files: [{
        uri: 'releases/2026.10.27/world-ce-100.json', mediaType: 'application/json', sha256: 'e'.repeat(64),
        bytes: 512, collection: 'world-100', sourceDigest: 'f'.repeat(64),
      }],
    } satisfies ReleaseManifest['packages'][number];
    const released = { ...manifest, packages: [...manifest.packages, world] } satisfies ReleaseManifest;
    const releasedManager = manager({
      listAvailable: vi.fn().mockResolvedValue(released.packages.map((releasePackage) => ({ releasePackage, installed: false }))),
    });

    render(<OfflineDataManager manifest={released} manager={releasedManager}/>);

    expect(await screen.findByRole('article', { name: '同期世界资料' })).toBeInTheDocument();
  });

  it('keeps release-owned core and China packages downloadable when exported world files are external', async () => {
    const exported = {
      ...manifest,
      packages: [
        manifest.packages[0],
        {
          id: 'china-territory', kind: 'territory', region: 'china', yearRange: [-221, 2026],
          required: true, dependencies: ['core-zh'], compressedBytes: 1024, recordCount: 10,
          licenseIds: ['CC-BY-4.0'], files: [{
            uri: 'releases/2026.10.27/china-territory.json', mediaType: 'application/json', sha256: 'c'.repeat(64),
            bytes: 1024, collection: 'china-territory', sourceDigest: 'd'.repeat(64),
          }],
        },
        {
          id: 'world-ce-100', kind: 'world', region: 'world', yearRange: [100, 199],
          required: false, dependencies: ['core-zh'], compressedBytes: 512, recordCount: 2,
          licenseIds: ['CC-BY-4.0'], files: [{
            uri: 'data/world/100.json', mediaType: 'application/json', sha256: 'e'.repeat(64),
            bytes: 512, collection: 'world-100', sourceDigest: 'f'.repeat(64),
          }],
        },
      ],
    } satisfies ReleaseManifest;
    const exportedManager = manager({
      listAvailable: vi.fn().mockResolvedValue(exported.packages.map((releasePackage) => ({ releasePackage, installed: false }))),
    });

    render(<OfflineDataManager manifest={exported} manager={exportedManager}/>);

    expect(await screen.findByRole('article', { name: '中文核心历史资料' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: '中国疆域资料' })).toBeInTheDocument();
    expect(screen.queryByRole('article', { name: '同期世界资料' })).not.toBeInTheDocument();
    expect(screen.queryByText(/当前内置资料尚未发布为可下载离线包/)).not.toBeInTheDocument();
  });

  it('shows an honest unsupported state for bundled content without leaking its internal revision', async () => {
    const bundled = {
      ...manifest,
      releaseId: 'bundled-2026-10-24',
      packages: [{
        ...manifest.packages[0],
        files: [{ ...manifest.packages[0].files[0], uri: 'data/bundled-content.json' }],
      }],
    } satisfies ReleaseManifest;

    render(<OfflineDataManager manifest={bundled}/>);

    expect(screen.getByText(/当前内置资料尚未发布为可下载离线包/)).toBeInTheDocument();
    expect(screen.queryByText(/bundled-2026-10-24/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '安装' })).not.toBeInTheDocument();
  });

  it('shows release, size, licenses, state, actions and the terrain limitation', async () => {
    render(<OfflineDataManager manifest={manifest} manager={manager()} storageManager={{
      estimate: vi.fn().mockResolvedValue({ quota: 10_000, usage: 1_000 }),
      persist: vi.fn().mockResolvedValue(true),
    }}/>)

    const item = await screen.findByRole('article', { name: '中文核心历史资料' });
    expect(item).toHaveTextContent('2026年10月27日');
    expect(item).not.toHaveTextContent(manifest.releaseId);
    expect(item).toHaveTextContent('2 KB');
    expect(item).toHaveTextContent('MIT、CC-BY-4.0');
    expect(item).toHaveTextContent('未安装');
    expect(within(item).getByRole('button', { name: '安装' })).toBeInTheDocument();
    expect(screen.getByText(/在线地形.*离线.*不可用/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '回退到上一版本' })).toBeInTheDocument();
  });

  it('estimates storage before install and requests persistence only after explicit success', async () => {
    const install = vi.fn().mockResolvedValue(undefined);
    const persist = vi.fn().mockResolvedValue(false);
    const estimate = vi.fn().mockResolvedValue({ quota: 10_000, usage: 1_000 });
    render(<OfflineDataManager manifest={manifest} manager={manager({ install })} storageManager={{ estimate, persist }}/>)

    await userEvent.click(await screen.findByRole('button', { name: '安装' }));

    await waitFor(() => expect(install).toHaveBeenCalledWith('core-zh'));
    expect(estimate.mock.invocationCallOrder[0]).toBeLessThan(install.mock.invocationCallOrder[0]);
    expect(persist.mock.invocationCallOrder[0]).toBeGreaterThan(install.mock.invocationCallOrder[0]);
    expect(await screen.findByRole('status')).toHaveTextContent('浏览器未授予持久存储');
  });

  it('warns and does not start an install when estimated storage is insufficient', async () => {
    const install = vi.fn();
    render(<OfflineDataManager manifest={manifest} manager={manager({ install })} storageManager={{
      estimate: vi.fn().mockResolvedValue({ quota: 4_200, usage: 300 }),
      persist: vi.fn(),
    }}/>)

    await userEvent.click(await screen.findByRole('button', { name: '安装' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('存储空间不足');
    expect(install).not.toHaveBeenCalled();
  });

  it('turns integrity failures into reader-safe language and keeps internal paths hidden', async () => {
    const install = vi.fn().mockRejectedValue(new Error('SHA-256 mismatch for releases/2026.10.27/private-core.json'));
    render(<OfflineDataManager manifest={manifest} manager={manager({ install })} storageManager={{
      estimate: vi.fn().mockResolvedValue({ quota: 10_000, usage: 0 }),
      persist: vi.fn(),
    }}/>);

    await userEvent.click(await screen.findByRole('button', { name: '安装' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('资料校验失败');
    expect(alert).toHaveTextContent('已保留当前版本');
    expect(alert).not.toHaveTextContent(/SHA-256|private-core|releases\//);
  });

  it('announces a successful activation so the shared content snapshot reloads', async () => {
    const activate = vi.fn().mockResolvedValue(undefined);
    const listener = vi.fn();
    globalThis.addEventListener(OFFLINE_RELEASE_CHANGE_EVENT, listener);
    render(<OfflineDataManager manifest={manifest} manager={manager({ activate })}/>);

    await userEvent.click(await screen.findByRole('button', { name: '启用已安装版本' }));

    await waitFor(() => expect(activate).toHaveBeenCalledTimes(1));
    expect(listener).toHaveBeenCalledTimes(1);
    globalThis.removeEventListener(OFFLINE_RELEASE_CHANGE_EVENT, listener);
  });

  it('still announces a committed activation when the following package-list refresh fails', async () => {
    const activate = vi.fn().mockResolvedValue(undefined);
    const listAvailable = vi.fn()
      .mockResolvedValueOnce([{ releasePackage: manifest.packages[0], installed: true }])
      .mockRejectedValueOnce(new Error('refresh failed'));
    const listener = vi.fn();
    globalThis.addEventListener(OFFLINE_RELEASE_CHANGE_EVENT, listener);
    render(<OfflineDataManager manifest={manifest} manager={manager({ activate, listAvailable })}/>);

    await userEvent.click(await screen.findByRole('button', { name: '启用已安装版本' }));

    await waitFor(() => expect(listener).toHaveBeenCalledTimes(1));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('版本已切换');
    expect(alert).toHaveTextContent('列表刷新失败');
    expect(alert).not.toHaveTextContent('当前版本未改变');
    globalThis.removeEventListener(OFFLINE_RELEASE_CHANGE_EVENT, listener);
  });
});
