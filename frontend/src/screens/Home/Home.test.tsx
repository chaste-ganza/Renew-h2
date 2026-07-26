import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Home } from './Home';

describe('Home', () => {
  it('renders the screen name', () => {
    render(<Home />);
    expect(screen.getByText('Home')).toBeTruthy();
  });
});
