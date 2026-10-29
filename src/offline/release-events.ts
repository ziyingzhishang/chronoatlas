export const OFFLINE_RELEASE_CHANGE_EVENT = 'chronoatlas:offline-release-change';

export function announceOfflineReleaseChange() {
  globalThis.dispatchEvent?.(new Event(OFFLINE_RELEASE_CHANGE_EVENT));
}
