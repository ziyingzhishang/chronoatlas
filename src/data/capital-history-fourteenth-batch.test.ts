import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';

const targetPolityIds = ['xia_early', 'shang', 'western_qin'] as const;

const recordsFor = (polityId: string) => capitalHistory.filter((record) => record.polityId === polityId);

describe('fourteenth-batch unresolved capital evidence review', () => {
  it('adds an explicit evidence boundary for the three safe supplementary cases', () => {
    for (const polityId of targetPolityIds) {
      const records = recordsFor(polityId);
      expect(records, polityId).not.toHaveLength(0);
      expect(records.every((record) => record.notes?.includes('第十四轮首都证据复核')), polityId).toBe(true);
      expect(records.every((record) => record.sourceIds.includes('capital-history-reference')), polityId).toBe(true);
    }

    expect(recordsFor('xia_early').every((record) => (
      record.role === 'disputed' && record.status === 'uncertain' && record.confidence === 'low'
    ))).toBe(true);
    expect(recordsFor('shang').every((record) => (
      record.role === 'disputed' && record.status === 'uncertain' && record.confidence === 'low'
    ))).toBe(true);
    expect(recordsFor('western_qin').some((record) => record.role === 'de_facto' && record.status === 'actual')).toBe(true);
  });

  it('keeps the supplementary cases non-formal and names their historical scope', () => {
    expect(recordsFor('xia_early').every((record) => record.notes?.includes('晚期二里头文化核心'))).toBe(true);
    expect(recordsFor('shang').every((record) => record.notes?.includes('早期二里头相关候选'))).toBe(true);
    expect(recordsFor('western_qin').every((record) => record.notes?.includes('河湟／枹罕阶段'))).toBe(true);

    for (const polityId of targetPolityIds) {
      expect(recordsFor(polityId).some((record) => record.role === 'primary' && record.status === 'formal'), polityId).toBe(false);
    }
  });
});
