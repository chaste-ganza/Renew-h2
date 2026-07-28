import type { AppEvent, MachineState } from "./types";
import { handleOnboardingTransition, type TransitionResult } from "./states/onboarding.states";
import { handleCheckInTransition } from "./states/checking.states";

export function transition(
    current: MachineState,
    event: AppEvent
): TransitionResult {
    const { state, context } = current;

    if (event.type === 'CHECKIN_STARTED') {
        return {
            state: { domain: 'CheckIn', step: 'MoodSelect' },
            context: {
                ...context,
                currentMood: null,
                currentNotes: null,
                latestTextAnalysis: null,
            },
        };
    }

    switch (state.domain) {
        case "Onboarding":
            return handleOnboardingTransition(state, context, event);

        case "CheckIn":
            return handleCheckInTransition(state, context, event);

        case "SOS":
            //TODO: return handleSosTransition(state,context,event);
            return { state, context };

        default:
            {
                const _exhaustive: never = state;
                return { state: _exhaustive, context };
            }
    }
}
