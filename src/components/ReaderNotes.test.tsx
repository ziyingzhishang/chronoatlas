import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReaderNotes } from './ReaderNotes';

describe('ReaderNotes', () => {
  it('renders historical caveats and citations without leaking internal workflow language', () => {
    render(<ReaderNotes note={{
      dateDescription: '约在该年；bundled-2026-10-24；来源解析 2/2',
      uncertainty: '边界仅能确定到区域；evidenceId claim-qin reviewStatus 覆盖审计；证据级别：A；4个原始坐标点',
      sources: [{
        title: '《史记》 claim-source-1',
        institution: '中华书局',
        citation: '卷六；待解析',
      }],
    }} />);

    expect(screen.getByText('资料说明')).toBeInTheDocument();
    expect(document.body).toHaveTextContent('约在该年');
    expect(document.body).toHaveTextContent('边界仅能确定到区域');
    expect(document.body).toHaveTextContent('《史记》');
    for (const forbidden of [
      '来源解析', 'evidenceId', 'claim-', 'bundled-', '覆盖审计',
      '个原始坐标点', 'reviewStatus', '证据级别：A', '待解析',
    ]) expect(document.body).not.toHaveTextContent(forbidden);
  });
});
