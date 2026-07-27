import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SupportDirectory } from './SupportDirectory';

describe('SupportDirectory', () => {
  it('renders the screen name', () => {
    render(<SupportDirectory />);
    expect(screen.getByText('SupportDirectory')).toBeTruthy();
  });
});
