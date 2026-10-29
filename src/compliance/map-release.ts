export interface MapReleaseCompliance {
  status: 'research-only' | 'approved-for-public-release';
  reviewNumber: string | null;
  reviewExpiresAt: string | null;
  approvedReleaseId: string | null;
  approvedReleaseManifestSha256: string | null;
  checkedSources: Array<{id: string; license: string; attribution: string}>;
  requiredNotices: string[];
}

export function evaluateMapRelease(manifest: MapReleaseCompliance, now = new Date(), releaseManifestSha256?: string, releaseId?: string): string[] {
  const issues: string[] = [];
  if (manifest.status !== 'approved-for-public-release') issues.push('manifest is research-only');
  const reviewNumber = manifest.reviewNumber?.trim();
  if (!reviewNumber) issues.push('map review number is required');
  else if (!isValidReviewNumber(reviewNumber)) issues.push('map review number is invalid');

  if (!manifest.reviewExpiresAt) issues.push('map review expiry date is required');
  else {
    const expiry = reviewExpiry(manifest.reviewExpiresAt);
    if (expiry === undefined) issues.push('map review expiry date is invalid');
    else if (expiry < now.getTime()) issues.push('map review approval is expired');
  }

  const approvedDigest = manifest.approvedReleaseManifestSha256?.trim().toLowerCase();
  if (!approvedDigest || !/^[a-f0-9]{64}$/.test(approvedDigest)) {
    issues.push('approved release manifest digest is required');
  } else if (releaseManifestSha256 && approvedDigest !== releaseManifestSha256.toLowerCase()) {
    issues.push('map approval does not match this release manifest');
  }

  const approvedReleaseId = manifest.approvedReleaseId?.trim();
  if (!approvedReleaseId || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(approvedReleaseId)) {
    issues.push('approved release id is required');
  } else if (releaseId && approvedReleaseId !== releaseId) {
    issues.push('map approval does not match this release id');
  }

  if (!Array.isArray(manifest.checkedSources) || !manifest.checkedSources.length) {
    issues.push('checked map sources are required');
  } else {
    for (const source of manifest.checkedSources) {
      if (!source?.id?.trim()) issues.push('map source id is required');
      if (!source?.license?.trim()) issues.push('map source license is required');
      if (!source?.attribution?.trim()) issues.push('map source attribution is required');
    }
  }

  if (!Array.isArray(manifest.requiredNotices) || !manifest.requiredNotices.length) {
    issues.push('required publication notices are required');
  } else if (manifest.requiredNotices.some((notice) => !notice?.trim())) {
    issues.push('required publication notice must not be empty');
  }
  return issues;
}

const REVIEW_NUMBER = /^(?:GS|[\p{Script=Han}A-Z]{1,6}S)[(（](?:19|20)\d{2}[)）]\d{3,8}号$/iu;
const PLACEHOLDER_REVIEW_NUMBER = /placeholder|sample|example|demo|test|tbd|todo|待填|示例|占位|未定|暂无/u;

function isValidReviewNumber(value: string) {
  return !PLACEHOLDER_REVIEW_NUMBER.test(value.toLocaleLowerCase()) && REVIEW_NUMBER.test(value);
}

function reviewExpiry(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const start = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== value) return undefined;
  return start.getTime() + 24 * 60 * 60 * 1000 - 1;
}
