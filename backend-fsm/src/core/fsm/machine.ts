import type { AppEvent, MachineState } from "./types";
import { handleOnboardingTransition, type TransitionResult } from "./states/onboarding.states";

export function transition(
    current: MachineState,
    event: AppEvent
): TransitionResult {
    const { state, context } = current;

    switch (state.domain) {
        case "Onboarding":
            return handleOnboardingTransition(state, context, event);

        case "CheckIn":
            //TODO: return handleCheckInTransition(state,context,event);
            return { state, context };

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