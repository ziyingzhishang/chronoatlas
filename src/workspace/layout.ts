export interface Point { x: number; y: number }
export interface Size { width: number; height: number }
export interface Preference { mode: 'docked'|'floating'; position: Point }
export function layoutFor(width: number, height: number) { return { mobile: width < 768, short: height < 500 }; }
export function clampPosition(point: Point, bounds: Size, size: Size): Point {
  const x = Math.max(12, Math.min(point.x, bounds.width - size.width - 12));
  const y = Math.max(64, Math.min(point.y, bounds.height - size.height - 64));
  return {x, y};
}
export function readPreference(raw: string|null): Preference {
  const fallback: Preference = {mode:'docked',position:{x:24,y:80}};
  try {
    const value = JSON.parse(raw ?? 'null');
    return value && ['docked','floating'].includes(value.mode) &&
      Number.isFinite(value.position?.x) && Number.isFinite(value.position?.y)
      ? {mode:value.mode,position:{x:value.position.x,y:value.position.y}} : fallback;
  } catch { return fallback; }
}
