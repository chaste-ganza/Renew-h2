import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CheckIn } from './CheckIn';

describe('CheckIn', () => {
  it('renders the screen name', () => {
    render(<CheckIn />);
    expect(screen.getByText('CheckIn')).toBeTruthy();
  });
});
