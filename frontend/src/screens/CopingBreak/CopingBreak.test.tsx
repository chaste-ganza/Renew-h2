import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CopingBreak } from './CopingBreak';

describe('CopingBreak', () => {
  it('renders breathing exercise actions', () => {
    render(<CopingBreak />);
    expect(screen.getByText('Skip')).toBeTruthy();
    expect(screen.getByText('I feel better')).toBeTruthy();
  });
});
