import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Home } from './Home';

describe('Home', () => {
  it('renders quick exercises', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText('Quick exercises')).toBeTruthy();
    expect(screen.getByText('Breathe')).toBeTruthy();
  });
});
