import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Onboarding } from './Onboarding';

describe('Onboarding', () => {
  it('renders the screen name', () => {
    render(<Onboarding />);
    expect(screen.getByText('Onboarding')).toBeTruthy();
  });
});
