// src/core/fsm/machine.ts
import type { AppEvent, MachineState } from '@core/fsm/types';
import { handleOnboardingTransition, type TransitionResult } from './states/onboarding.states';
import { handleCheckInTransition } from './states/checking.states';
import { handleSosTransition } from './states/sos.states';
import { applyThemeChange } from './states/theme.states';

export function transition(
    current: MachineState,
    event: AppEvent
): TransitionResult {
    const { state, context } = current;
    if (event.type === 'CHECKIN_STARTED') {
        return {
            state: { domain: 'CheckIn', step: 'MoodSelect' },
            context: { ...context, currentMood: null, currentNotes: null },
        };
    }

    if (event.type === 'SOS_TRIGGERED') {
        return {
            state: { domain: 'SOS', step: 'ConsentPending' },
            context,
        };
    }

    if (event.type === 'THEME_CHANGED') {
        return {
            state,
            context: applyThemeChange(context, event.theme),
            effects: ['PERSIST_SNAPSHOT'],
        };
    }

    switch (state.domain) {
        case 'Onboarding':
            return handleOnboardingTransition(state, context, event);

        case 'CheckIn':
            return handleCheckInTransition(state, context, event);

        case 'SOS':
            return handleSosTransition(state, context, event);

        default: {
            const _exhaustive: never = state;
            return { state: _exhaustive, context };
        }
    }
}