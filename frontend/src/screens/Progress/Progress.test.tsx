import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Progress } from './Progress';

describe('Progress', () => {
  it('renders growth points', () => {
    render(
      <BrowserRouter>
        <Progress />
      </BrowserRouter>
    );
    expect(screen.getByText('Your Journey')).toBeTruthy();
    expect(screen.getByText('Growth Points')).toBeTruthy();
  });
});
