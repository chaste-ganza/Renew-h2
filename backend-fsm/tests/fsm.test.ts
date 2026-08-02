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
