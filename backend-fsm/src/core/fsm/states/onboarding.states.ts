import type { AppState, AppContext, AppEvent } from "../types";

export interface TransitionResult {
    state: AppState;
    context: AppContext;
    effects?: string[];
}

export function handleOnboardingTransition(
    state: Extract<AppState, { domain: 'Onboarding' }>,
    context: AppContext,
    event: AppEvent
): TransitionResult {
    switch (state.step) {
        case 'Welcome':
            if (event.type === 'ONBOARDING_NEXT') {
                return {
                    state: { domain: 'Onboarding', step: 'AgeInput' },
                    context,
                };
            }
            break;

        case 'AgeInput':
            if (event.type === 'ONBOARDING_AGE_SUBMITTED') {
                return {
                    state: { domain: 'Onboarding', step: 'ThemeSelect' },
                    context: {
                        ...context,
                        profile: context.profile
                            ? { ...context.profile, ageRange: event.ageRange }
                            : null,
                    },
                };
            }
            break;

        case 'ThemeSelect':
            if (event.type === 'ONBOARDING_THEME_SELECTED') {
                return {
                    state: { domain: 'Onboarding', step: 'Complete' },
                    context,
                    effects: ['CREATE_PROFILE'],
                };
            }
            break;

        case 'Complete':
            break;
    }

    return { state, context };
}