import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Settings } from './Settings';

describe('Settings', () => {
  it('renders the screen name', () => {
    render(<Settings />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });
});
