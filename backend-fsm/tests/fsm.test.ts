import { describe, it, expect } from 'bun:test';
import { transition } from '@core/fsm/machine';
import { initialState, initialContext, type MachineState } from '@core/fsm/types';

describe('Onboarding flow', () => {
    it('starts at Welcome', () => {
        expect(initialState).toEqual({ domain: 'Onboarding', step: 'Welcome' });
    });

    it('moves from Welcome to PassphraseSetup on ONBOARDING_NEXT', () => {
        const start: MachineState = { state: initialState, context: initialContext };

        const result = transition(start, { type: 'ONBOARDING_NEXT' });

        expect(result.state).toEqual({ domain: 'Onboarding', step: 'PassphraseSetup' });
        expect(result.context).toEqual(initialContext);
    });

    it('moves from PassphraseSetup to AgeInput and stores pendingSalt', () => {
        const start: MachineState = {
            state: { domain: 'Onboarding', step: 'PassphraseSetup' },
            context: initialContext,
        };

        const result = transition(start, {
            type: 'ONBOARDING_PASSPHRASE_SET',
            saltBase64: 'fake-salt-for-testing',
        });

        expect(result.state).toEqual({ domain: 'Onboarding', step: 'AgeInput' });
        expect(result.context.pendingSalt).toBe('fake-salt-for-testing');
    });

    it('SOS_TRIGGERED interrupts from ANY state, including mid-onboarding', () => {
        const start: MachineState = { state: initialState, context: initialContext };

        const result = transition(start, { type: 'SOS_TRIGGERED' });

        expect(result.state).toEqual({ domain: 'SOS', step: 'ConsentPending' });
    });

    it('ignores truly irrelevant events at the current step (no-op)', () => {
        const start: MachineState = { state: initialState, context: initialContext };

        const result = transition(start, {
            type: 'CHECKIN_MOOD_SELECTED',
            mood: 'happy',
        });

        expect(result.state).toEqual(initialState);
    });

    it('runs the full onboarding sequence end-to-end', () => {
        let machine: MachineState = { state: initialState, context: initialContext };

        // Welcome -> PassphraseSetup
        let result = transition(machine, { type: 'ONBOARDING_NEXT' });
        machine = { state: result.state, context: result.context };
        expect(machine.state).toEqual({ domain: 'Onboarding', step: 'PassphraseSetup' });

        // PassphraseSetup -> AgeInput
        result = transition(machine, {
            type: 'ONBOARDING_PASSPHRASE_SET',
            saltBase64: 'fake-salt-for-testing',
        });
        machine = { state: result.state, context: result.context };
        expect(machine.state).toEqual({ domain: 'Onboarding', step: 'AgeInput' });
        expect(machine.context.pendingSalt).toBe('fake-salt-for-testing');

        // AgeInput -> ThemeSelect
        result = transition(machine, {
            type: 'ONBOARDING_AGE_SUBMITTED',
            ageRange: '18-24',
        });
        machine = { state: result.state, context: result.context };
        expect(machine.state).toEqual({ domain: 'Onboarding', step: 'ThemeSelect' });

        result = transition(machine, {
            type: 'ONBOARDING_THEME_SELECTED',
            theme: 'companion',
        });
        machine = { state: result.state, context: result.context };
        expect(machine.state).toEqual({ domain: 'Onboarding', step: 'Complete' });
        expect(result.effects).toContain('CREATE_PROFILE');
    });
});

describe('CheckIn flow', () => {
    it('CHECKIN_STARTED works globally and resets stale mood/notes', () => {
        const dirtyContext = { ...initialContext, currentMood: 'old-mood', currentNotes: 'old-notes' };
        const start: MachineState = { state: initialState, context: dirtyContext };

        const result = transition(start, { type: 'CHECKIN_STARTED' });

        expect(result.state).toEqual({ domain: 'CheckIn', step: 'MoodSelect' });
        expect(result.context.currentMood).toBeNull();
        expect(result.context.currentNotes).toBeNull();
    });

    it('runs the full check-in sequence and triggers save effects', () => {
        let machine: MachineState = { state: initialState, context: initialContext };

        let result = transition(machine, { type: 'CHECKIN_STARTED' });
        machine = { state: result.state, context: result.context };
        expect(machine.state).toEqual({ domain: 'CheckIn', step: 'MoodSelect' });

        result = transition(machine, { type: 'CHECKIN_MOOD_SELECTED', mood: 'calm' });
        machine = { state: result.state, context: result.context };
        expect(machine.state).toEqual({ domain: 'CheckIn', step: 'FollowUp' });
        expect(machine.context.currentMood).toBe('calm');

        result = transition(machine, {
            type: 'CHECKIN_FOLLOWUP_SUBMITTED',
            notes: 'felt good today',
        });
        machine = { state: result.state, context: result.context };
        expect(machine.state).toEqual({ domain: 'CheckIn', step: 'Saved' });
        expect(result.effects).toEqual(['SAVE_CHECKIN', 'PERSIST_SNAPSHOT']);
    });
});

describe('SOS flow', () => {
    it('runs consent grant -> connect -> cancel sequence', () => {
        let machine: MachineState = { state: initialState, context: initialContext };

        let result = transition(machine, { type: 'SOS_TRIGGERED' });
        machine = { state: result.state, context: result.context };
        expect(machine.state).toEqual({ domain: 'SOS', step: 'ConsentPending' });

        result = transition(machine, { type: 'SOS_CONSENT_GRANTED' });
        machine = { state: result.state, context: result.context };
        expect(machine.state).toEqual({ domain: 'SOS', step: 'ConsentGranted' });
        expect(machine.context.sosConsentTimestamp).not.toBeNull();
        expect(result.effects).toContain('RECORD_CONSENT');

        result = transition(machine, { type: 'SOS_CANCELLED' });
        machine = { state: result.state, context: result.context };
        expect(machine.state).toEqual({ domain: 'SOS', step: 'Idle' });
        expect(machine.context.sosConsentTimestamp).toBeNull();
    });

    it('clears consent timestamp on denial', () => {
        const start: MachineState = {
            state: { domain: 'SOS', step: 'ConsentPending' },
            context: initialContext,
        };

        const result = transition(start, { type: 'SOS_CONSENT_DENIED' });

        expect(result.state).toEqual({ domain: 'SOS', step: 'Idle' });
        expect(result.context.sosConsentTimestamp).toBeNull();
    });
});