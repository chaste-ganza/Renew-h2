import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('renders the suggested task and actions', () => {
    render(<TaskCard />);
    expect(screen.getByText('Take a 5-minute walk outside')).toBeTruthy();
    expect(screen.getByText('Done')).toBeTruthy();
    expect(screen.getByText('Skip for now')).toBeTruthy();
  });
});
