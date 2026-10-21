import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { LocaleProvider } from '../i18n/locale';
import { getHistoricalState } from '../domain/history-state';
import { DirectoryPopover } from './DirectoryPopover';

test('shows current polities and places and selects a directory item', async () => {
  const onSelectEntity = vi.fn();
  render(<LocaleProvider><DirectoryPopover state={getHistoricalState(226)} selectedEntity={undefined} onSelectEntity={onSelectEntity} onBackToDirectory={vi.fn()} onClose={vi.fn()} /></LocaleProvider>);
  expect(screen.getByText('魏')).toBeInTheDocument();
  expect(screen.getByText('长安')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /魏/ }));
  expect(onSelectEntity).toHaveBeenCalledWith({ type: 'polity', id: 'wei_three' });
});
