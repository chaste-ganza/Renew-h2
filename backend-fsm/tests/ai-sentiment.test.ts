import { describe, expect, it } from 'vitest';
import { analyzeUserInputText } from '@ai/inference.service';
import { initialContext, type MachineState } from '@core/fsm/types';
import { transition } from '@core/fsm/machine';

describe('local AI sentiment/context helper', () => {
    it('classifies self-harm language as crisis severity', () => {
        const analysis = analyzeUserInputText('I want to die and I cannot go on.');

        expect(analysis.severity).toBe('crisis');
        expect(analysis.sentiment).toBe('sad');
        expect(analysis.contextTags).toContain('self-harm');
        expect(analysis.riskFactors).toContain('self-harm-ideation');
    });

    it('captures contextual stress signals for non-crisis text', () => {
        const analysis = analyzeUserInputText('School exams are overwhelming and I cannot sleep.', {
            mood: 'anxious',
        });

        expect(analysis.severity).toBe('moderate');
        expect(analysis.contextTags).toContain('school');
        expect(analysis.contextTags).toContain('academic-pressure');
        expect(analysis.contextTags).toContain('sleep');
        expect(analysis.emotionTags).toContain('overwhelmed');
    });

    it('feeds severity analysis into the check-in FSM context', () => {
        const start: MachineState = {
            state: { domain: 'CheckIn', step: 'FollowUp' },
            context: initialContext,
        };
        const analysis = analyzeUserInputText('I feel hopeless and empty.');

        const result = transition(start, {
            type: 'CHECKIN_TEXT_ANALYZED',
            analysis,
        });

        expect(result.context.latestTextAnalysis?.severity).toBe('moderate');
        expect(result.effects).toContain('SUGGEST_COPING_BREAK');
    });

    it('tracks protective factors separately from risk context', () => {
        const analysis = analyzeUserInputText('I was anxious, but breathing helped and I will talk to my counselor tomorrow.');

        expect(analysis.sentiment).toBe('mixed');
        expect(analysis.emotionTags).toContain('anxious');
        expect(analysis.protectiveFactors).toContain('coping-strategy');
        expect(analysis.protectiveFactors).toContain('help-seeking');
        expect(analysis.protectiveFactors).toContain('future-orientation');
    });
});
