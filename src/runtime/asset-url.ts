export function publicAssetUrl(path: string, baseUrl = import.meta.env.BASE_URL): string {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(path);
  } catch {
    throw new Error(`Public asset path must be a safe relative path: ${path}`);
  }

  const hasUnsafeSegment = decodedPath.split('/').some((segment) => segment === '.' || segment === '..');
  if (
    !path ||
    decodedPath.startsWith('/') ||
    decodedPath.includes('\\') ||
    path.includes('..') ||
    hasUnsafeSegment ||
    /^[a-z][a-z\d+.-]*:/i.test(decodedPath)
  ) {
    throw new Error(`Public asset path must be a safe relative path: ${path}`);
  }
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${path}`.replace(/\/{2,}/g, '/');
}
