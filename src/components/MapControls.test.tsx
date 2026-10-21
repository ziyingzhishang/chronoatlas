import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { LayerToggle } from './LayerToggle';
import { Legend } from './Legend';

test('toggles the historical place layer', async () => {
  const onChange = vi.fn();
  const user = userEvent.setup();
  render(<LayerToggle visibleLayers={new Set(['places'])} onChange={onChange} />);
  await user.click(screen.getByRole('checkbox', { name: '历史地名' }));
  expect(onChange).toHaveBeenCalledWith('places', false);
});

test('explains boundary confidence and control styles', () => {
  render(<Legend />);
  expect(screen.getByText('直接控制')).toBeInTheDocument();
  expect(screen.getByText('争议范围')).toBeInTheDocument();
  expect(screen.getByText('低置信度')).toBeInTheDocument();
});
