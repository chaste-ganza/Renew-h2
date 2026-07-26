import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SOS } from './SOS';

describe('SOS', () => {
  it('renders the screen name', () => {
    render(<SOS />);
    expect(screen.getByText('SOS')).toBeTruthy();
  });
});
