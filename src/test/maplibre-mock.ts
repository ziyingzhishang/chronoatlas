import { vi } from 'vitest';
import type { MapOptions, StyleSpecification } from 'maplibre-gl';

// A renderer boundary for jsdom; real rendering and gestures are checked in-browser.
export const mapInstances: TestMap[] = [];
export class TestMap {
  handlers = new Map<string, ((event: any) => void)[]>();
  sources = new Map<string, { setData: ReturnType<typeof vi.fn>; setTiles: ReturnType<typeof vi.fn> }>();
  canvas = document.createElement('canvas');
  setLayoutProperty = vi.fn();
  setPaintProperty = vi.fn();
  setFilter = vi.fn();
  remove = vi.fn();
  resize = vi.fn();
  addControl = vi.fn();
  zoomIn = vi.fn();
  zoomOut = vi.fn();
  rotateTo = vi.fn();
  resetNorthPitch = vi.fn();
  easeTo = vi.fn();
  flyTo = vi.fn();
  fitBounds = vi.fn();
  queryRenderedFeatures = vi.fn(() => []);
  constructor(public options: MapOptions) {
    mapInstances.push(this);
  }
  on(type: string, fn: (event: any) => void) { this.handlers.set(type, [...this.handlers.get(type) ?? [], fn]); return this; }
  emit(type: string, event = {}) {
    if (type === 'style.load') for (const id of Object.keys((this.options.style as StyleSpecification).sources)) {
      this.sources.set(id, { setData: vi.fn(), setTiles: vi.fn() });
    }
    for (const fn of this.handlers.get(type) ?? []) fn(event);
  }
  getSource(id: string) { return this.sources.get(id); }
  getLayer(id: string) { return { id }; }
  getCanvas() { return this.canvas; }
  getContainer() { return this.canvas; }
  getZoom() { return 4.3; }
  getCenter() { return { toArray: () => (this.options.center ?? [105, 35]) as [number, number] }; }
  getBearing() { return 30; }
  getPitch() { return 45; }
  isSourceLoaded() { return true; }
}
