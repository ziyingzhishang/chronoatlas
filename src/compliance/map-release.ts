export interface MapReleaseCompliance {
  status: 'research-only' | 'approved-for-public-release';
  reviewNumber: string | null;
  reviewExpiresAt: string | null;
  checkedSources: Array<{id: string; license: string; attribution: string}>;
  requiredNotices: string[];
}

export function evaluateMapRelease(manifest: MapReleaseCompliance, now = new Date()): string[] {
  const issues: string[] = [];
  if (manifest.status !== 'approved-for-public-release') issues.push('manifest is research-only');
  if (!manifest.reviewNumber?.trim()) issues.push('map review number is required');
  if (!manifest.reviewExpiresAt) issues.push('map review expiry date is required');
  else if (new Date(`${manifest.reviewExpiresAt}T23:59:59Z`).getTime() < now.getTime()) issues.push('map review approval is expired');
  if (!manifest.checkedSources.length) issues.push('checked map sources are required');
  if (!manifest.requiredNotices.length) issues.push('required publication notices are required');
  return issues;
}
