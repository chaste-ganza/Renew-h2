import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Onboarding } from './Onboarding';

describe('Onboarding', () => {
  it('renders privacy promise', () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );
    expect(screen.getByText('Our Privacy Promise')).toBeTruthy();
  });
});
