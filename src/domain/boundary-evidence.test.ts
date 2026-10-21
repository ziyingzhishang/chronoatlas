import { describe, expect, test } from 'vitest';
import { validateBoundaryEvidence } from './boundary-evidence';
import type { BoundaryState, EvidenceLevel } from './types';

const square: GeoJSON.Polygon = {
  type: 'Polygon',
  coordinates: [[[100, 30], [101, 30], [101, 31], [100, 30]]],
};

function boundary(level: EvidenceLevel, overrides: Partial<BoundaryState> = {}): BoundaryState {
  return {
    id: `boundary-${level}`,
    polityId: 'qin',
    validFrom: -221,
    validTo: -221,
    snapshotYear: -221,
    sourceName: 'Test source',
    sourceUrl: 'https://example.test/source',
    vertexCount: 4,
    geometry: square,
    controlType: 'direct',
    confidence: 'medium',
    sourceIds: ['test-source'],
    evidence: {
      evidenceLevel: level,
      derivation: level === 'A' ? 'direct-source' : level === 'B' ? 'licensed-digitization' : level === 'C' ? 'nearest-same-polity' : 'cultural-core',
      reviewStatus: 'source-checked',
      citations: [{title: 'Test source', urlOrCitation: 'https://example.test/source'}],
      uncertaintyNote: 'Test-only uncertainty statement.',
    },
    ...overrides,
  };
}

describe('validateBoundaryEvidence', () => {
  test('rejects a C record derived from another polity', () => {
    const candidate = boundary('C');
    const source = boundary('A', {id: 'han-source', polityId: 'han_western'});

    expect(validateBoundaryEvidence(candidate, [source])).toContain(
      'C evidence must derive from the same polity',
    );
  });

  test('only D evidence may use point geometry', () => {
    const point: GeoJSON.Point = {type: 'Point', coordinates: [112.7, 34.7]};

    expect(validateBoundaryEvidence(boundary('A', {geometry: point}), [])).toContain(
      'non-D evidence must be polygonal',
    );
    expect(validateBoundaryEvidence(boundary('D', {geometry: point}), [])).toEqual([]);
  });

  test('requires at least one citation and a meaningful uncertainty note', () => {
    const candidate = boundary('A', {
      evidence: {
        evidenceLevel: 'A',
        derivation: 'direct-source',
        reviewStatus: 'source-checked',
        citations: [],
        uncertaintyNote: '',
      },
    });

    expect(validateBoundaryEvidence(candidate, [])).toEqual(expect.arrayContaining([
      'evidence requires at least one citation',
      'evidence requires an uncertainty note',
    ]));
  });

  test('rejects derivations that do not match their evidence level', () => {
    const candidate = boundary('B', {
      evidence: {
        evidenceLevel: 'B',
        derivation: 'maximum-record',
        reviewStatus: 'source-checked',
        citations: [{title: 'Test source', urlOrCitation: 'https://example.test/source'}],
        uncertaintyNote: 'Test-only uncertainty statement.',
      },
    });

    expect(validateBoundaryEvidence(candidate, [])).toContain(
      'maximum-record is not valid for evidence level B',
    );
  });
});
