import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Settings } from './Settings';

describe('Settings', () => {
  it('renders language options', () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );
    expect(screen.getByText('Language')).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
  });
});
