import { expect, test } from 'vitest';
import { events } from './events';
import { sourceById } from './sources';
import { places } from './places';

test('every timeline shortcut can resolve an enriched event from the shared catalog', () => {
  for (const year of [-403, -221, 220, 589, 618, 755, 907, 960, 1271, 1368, 1644, 1912, 1949]) {
    const event = events.find(item => item.year === year);
    expect(event, `missing shortcut at ${year}`).toBeDefined();
    for (const field of ['background', 'process', 'impact', 'mapNote'] as const) {
      expect(event?.[field], `${year}: ${field}`).toEqual(expect.any(String));
      expect(event?.[field]?.trim().length).toBeGreaterThan(0);
    }
  }
});

test('curated entries expose traceable references and explicit historical precision', () => {
  for (const event of events) {
    expect(['china', 'world']).toContain(event.region);
    expect(event.category?.trim().length).toBeGreaterThan(0);
    expect(['year', 'approximate', 'range']).toContain(event.datePrecision);
    expect(['checked', 'partial']).toContain(event.verification);
    expect(event.references?.length, event.id).toBeGreaterThan(0);
    for (const reference of event.references ?? []) {
      expect(new URL(reference.url).protocol).toBe('https:');
      expect(reference.title.trim().length).toBeGreaterThan(0);
      expect(reference.detail?.trim().length).toBeGreaterThan(0);
    }
    for (const sourceId of event.sourceIds) expect(sourceById[sourceId], event.id).toBeDefined();
    if (event.placeId) expect(places.some(place => place.id === event.placeId)).toBe(true);
  }
});

test('catalog supports stable selection and chronological navigation without invalid years', () => {
  expect(new Set(events.map(event => event.id)).size).toBe(events.length);
  expect(events.map(event => event.year)).toEqual(events.map(event => event.year).sort((a, b) => a - b));
  for (const event of events) {
    expect(Number.isInteger(event.year)).toBe(true);
    expect(event.year).not.toBe(0);
    if (event.endYear !== undefined && event.datePrecision === 'range') {
      expect(event.endYear).toBeGreaterThanOrEqual(event.year);
      expect(event.endYear).not.toBe(0);
      expect(event.datePrecision).toBe('range');
    }
    if (event.endYear !== undefined && event.datePrecision !== 'range') {
      expect(['year', 'approximate']).toContain(event.datePrecision);
      expect(event.endYear).toBeGreaterThanOrEqual(event.year);
    }
    if (event.coordinates) {
      expect(event.locationPrecision).toMatch(/^(approximate|confirmed)$/);
      expect(event.coordinates[0]).toBeGreaterThanOrEqual(-180);
      expect(event.coordinates[0]).toBeLessThanOrEqual(180);
      expect(event.coordinates[1]).toBeGreaterThanOrEqual(-90);
      expect(event.coordinates[1]).toBeLessThanOrEqual(90);
    } else expect(event.locationPrecision).toBeUndefined();
  }
});

test('legacy selections still resolve and extended rebellion includes its final year', () => {
  for (const id of ['partition-jin', 'qin-unification', 'chu-han-contention', 'red-cliffs', 'sui-unification', 'tang-founded', 'an-lushan-rebellion', 'five-dynasties']) {
    expect(events.find(event => event.id === id), id).toBeDefined();
  }
  expect(events.find(event => event.id === 'an-lushan-rebellion')?.endYear).toBe(763);
  expect(events.some(event => event.region === 'world')).toBe(true);
  expect(events.some(event => event.datePrecision === 'approximate')).toBe(true);
});
