import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress } from './Progress';

describe('Progress', () => {
  it('renders the screen name', () => {
    render(<Progress />);
    expect(screen.getByText('Progress')).toBeTruthy();
  });
});
