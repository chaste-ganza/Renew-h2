import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SOS } from './SOS';

describe('SOS', () => {
  it('renders the emergency contacts', () => {
    render(<SOS />);
    expect(screen.getByText('You are not alone.')).toBeTruthy();
    expect(screen.getByText('Call 114')).toBeTruthy();
  });
});
