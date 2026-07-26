import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('renders the screen name', () => {
    render(<TaskCard />);
    expect(screen.getByText('TaskCard')).toBeTruthy();
  });
});
