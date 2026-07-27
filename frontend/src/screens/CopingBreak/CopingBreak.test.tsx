import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CopingBreak } from './CopingBreak';

describe('CopingBreak', () => {
  it('renders the screen name', () => {
    render(<CopingBreak />);
    expect(screen.getByText('CopingBreak')).toBeTruthy();
  });
});
