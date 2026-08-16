import type { AppState, AppEvent, AppContext } from '../../../core/fsm/types';
import type { TransitionResult } from './onboarding.states';

export function handleCheckInTransition(
    state: Extract<AppState, { domain: 'CheckIn' }>,
    context: AppContext,
    event: AppEvent
): TransitionResult {
    switch (state.step) {
        case 'MoodSelect':
            if (event.type === 'CHECKIN_MOOD_SELECTED') {
                return {
                    state: { domain: 'CheckIn', step: 'FollowUp' },
                    context: { ...context, currentMood: event.mood },
                };
            }
            break;

        case 'FollowUp':
            if (event.type === 'CHECKIN_FOLLOWUP_SUBMITTED') {
                return {
                    state: { domain: 'CheckIn', step: 'Saved' },
                    context: {
                        ...context,
                        currentNotes: event.notes ?? null,
                    },
                    effects: ['SAVE_CHECKIN', 'PERSIST_SNAPSHOT'],
                };
            }
            break;

        case 'Saved':
            if (event.type === 'CHECKIN_RESET') {
                return {
                    state: { domain: 'CheckIn', step: 'MoodSelect' },
                    context: { ...context, currentMood: null, currentNotes: null },
                };
            }
            break;
    }

    return { state, context };
}