import type { AppState } from './types';

export interface UiConfig {
    title: string;
    subtitle?: string;
    primaryActionLabel: string; // Label for the  next/continue button
    showBackButton: boolean;
    inputType: 'none' | 'passphrase' | 'ageRange' | 'theme' | 'mood' | 'text' | 'consent';
}

export function getUiConfigForState(state: AppState): UiConfig {
    const key = `${state.domain}.${state.step}`;

    switch (key) {
        case 'Onboarding.Welcome':
            return {
                title: 'Welcome',
                subtitle: 'Let\'s get you set up.',
                primaryActionLabel: 'Get Started',
                showBackButton: false,
                inputType: 'none',
            };

        case 'Onboarding.PassphraseSetup':
            return {
                title: 'Create a Passphrase',
                subtitle: 'This protects your data — only you can unlock it.',
                primaryActionLabel: 'Continue',
                showBackButton: false,
                inputType: 'passphrase',
            };

        case 'Onboarding.AgeInput':
            return {
                title: 'How old are you?',
                primaryActionLabel: 'Continue',
                showBackButton: true,
                inputType: 'ageRange',
            };

        case 'Onboarding.ThemeSelect':
            return {
                title: 'Choose Your Space',
                primaryActionLabel: 'Finish Setup',
                showBackButton: true,
                inputType: 'theme',
            };

        case 'Onboarding.Complete':
            return {
                title: 'All Set!',
                primaryActionLabel: 'Start',
                showBackButton: false,
                inputType: 'none',
            };

        case 'CheckIn.MoodSelect':
            return {
                title: 'How are you feeling?',
                primaryActionLabel: 'Next',
                showBackButton: true,
                inputType: 'mood',
            };

        case 'CheckIn.FollowUp':
            return {
                title: 'Want to add anything?',
                primaryActionLabel: 'Save',
                showBackButton: true,
                inputType: 'text',
            };

        case 'CheckIn.Saved':
            return {
                title: 'Check-in Saved',
                primaryActionLabel: 'Done',
                showBackButton: false,
                inputType: 'none',
            };

        case 'SOS.Idle':
            return {
                title: 'Support',
                primaryActionLabel: 'Get Help Now',
                showBackButton: true,
                inputType: 'none',
            };

        case 'SOS.ConsentPending':
            return {
                title: 'Before We Connect',
                subtitle: 'We need your consent to share limited info with support.',
                primaryActionLabel: 'I Consent',
                showBackButton: true,
                inputType: 'consent',
            };

        case 'SOS.ConsentGranted':
            return {
                title: 'Connecting You',
                primaryActionLabel: 'Continue',
                showBackButton: false,
                inputType: 'none',
            };

        case 'SOS.ConnectingCall':
            return {
                title: 'Connecting...',
                primaryActionLabel: 'Cancel',
                showBackButton: false,
                inputType: 'none',
            };

        default:
            // Safety net: an unmapped state shouldn't crash the UI.
            return {
                title: 'Loading...',
                primaryActionLabel: 'Continue',
                showBackButton: false,
                inputType: 'none',
            };
    }
}