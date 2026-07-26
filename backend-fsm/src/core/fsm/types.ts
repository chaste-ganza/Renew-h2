import type { UserProfiles } from "../../types/global";

export type AppState =
    | { domain: 'Onboarding'; step: 'Welcome' }
    | { domain: 'Onboarding'; step: 'AgeInput' }
    | { domain: 'Onboarding'; step: 'ThemeSelect' }
    | { domain: 'Onboarding'; step: 'Complete' }
    | { domain: 'CheckIn'; step: 'MoodSelect' }
    | { domain: 'CheckIn'; step: 'FollowUp' }
    | { domain: 'CheckIn'; step: 'Saved' }
    | { domain: 'SOS'; step: 'Idle' }
    | { domain: 'SOS'; step: 'ConsentPending' }
    | { domain: 'SOS'; step: 'ConsentGranted' }
    | { domain: 'SOS'; step: 'ConnectingCall' };

export type AppEvent =
    | { type: 'ONBOARDING_NEXT' }
    | { type: 'ONBOARDING_AGE_SUBMITTED'; ageRange: UserProfiles['ageRange'] }
    | { type: 'ONBOARDING_THEME_SELECTED'; theme: UserProfiles['themePreferences'] }
    | { type: 'CHECKIN_STARTED' }
    | { type: 'CHECKIN_MOOD_SELECTED'; mood: string }
    | { type: 'CHECKIN_FOLLOWUP_SUBMITTED'; notes?: string }
    | { type: 'CHECKIN_RESET' }
    | { type: 'SOS_TRIGGERED' }
    | { type: 'SOS_CONSENT_GRANTED' }
    | { type: 'SOS_CONSENT_DENIED' }
    | { type: 'SOS_CALL_CONNECTED' }
    | { type: 'SOS_CANCELLED' };

export interface AppContext {
    profile: UserProfiles | null;       // null until onboarding completes
    currentMood: string | null;        // set during CheckIn.MoodSelect
    currentNotes: string | null;       // set during CheckIn.FollowUp
    sosConsentTimestamp: number | null; // when consent was granted, for audit
}

export interface MachineState {
    state: AppState;
    context: AppContext;
}

export const initialContext: AppContext = {
    profile: null,
    currentMood: null,
    currentNotes: null,
    sosConsentTimestamp: null,
};

export const initialState: AppState = { domain: 'Onboarding', step: 'Welcome' };