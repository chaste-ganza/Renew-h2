import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CheckIn } from './CheckIn';
import * as fsmHook from '@/hooks/useFsmState';

describe('CheckIn', () => {
  it('renders the initial mood question', () => {
    vi.spyOn(fsmHook, 'useFsmState').mockReturnValue({
      state: 'checkin_mood',
      uiConfig: {},
      dispatch: vi.fn()
    });

    render(<CheckIn />);
    expect(screen.getByText('How are you feeling right now?')).toBeTruthy();
    expect(screen.getByText('Calm / Okay')).toBeTruthy();
  });
});
