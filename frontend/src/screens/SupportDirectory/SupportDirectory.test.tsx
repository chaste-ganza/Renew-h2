import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SupportDirectory } from './SupportDirectory';

describe('SupportDirectory', () => {
  it('renders the CHW list', () => {
    render(
      <BrowserRouter>
        <SupportDirectory />
      </BrowserRouter>
    );
    expect(screen.getByText('Support Directory')).toBeTruthy();
    expect(screen.getByText('Grace Uwase')).toBeTruthy();
  });
});
