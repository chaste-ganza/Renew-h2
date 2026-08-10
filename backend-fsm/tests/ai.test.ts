import { describe, it, expect } from 'bun:test';
import { isValidRephrase, cleanOutput } from '@ai/inference.service';
import { buildRephraseQuestionPrompt, buildDiversifiedCheckInPrompt, SYSTEM_PROMPT } from '@ai/prompt.templates';

describe('isValidRephrase', () => {
    const original = 'How are you feeling today?';

    it('accepts a normal, reasonable rephrase', () => {
        expect(isValidRephrase('How are you feeling right now?', original)).toBe(true);
    });

    it('rejects an empty output', () => {
        expect(isValidRephrase('', original)).toBe(false);
        expect(isValidRephrase('   ', original)).toBe(false);
    });

    it('rejects output that is far longer than the original', () => {
        const tooLong = 'a'.repeat(original.length * 5);
        expect(isValidRephrase(tooLong, original)).toBe(false);
    });

    it('rejects output that echoes instruction language', () => {
        expect(isValidRephrase('Sure, here is a rewrite of your question: ...', original)).toBe(false);
        expect(isValidRephrase('I will rephrase this for you.', original)).toBe(false);
    });
});

describe('cleanOutput', () => {
    it('trims surrounding whitespace', () => {
        expect(cleanOutput('  How are you doing?  ')).toBe('How are you doing?');
    });

    it('strips surrounding double quotes', () => {
        expect(cleanOutput('"How are you doing?"')).toBe('How are you doing?');
    });

    it('strips surrounding single quotes', () => {
        expect(cleanOutput("'How are you doing?'")).toBe('How are you doing?');
    });

    it('strips a leading or trailing quote even if unpaired', () => {
        expect(cleanOutput('"How are you doing?')).toBe('How are you doing?');
    });

    it('leaves already-clean output unchanged', () => {
        expect(cleanOutput('How are you doing?')).toBe('How are you doing?');
    });
});

describe('buildRephraseQuestionPrompt', () => {
    it('includes the original question, tone, and constraints', () => {
        const prompt = buildRephraseQuestionPrompt('How are you feeling?', '13-17');

        expect(prompt).toContain('How are you feeling?');
        expect(prompt).toContain('ONLY the rewritten question');
    });

    it('produces different tone instructions for different age ranges', () => {
        const teenPrompt = buildRephraseQuestionPrompt('Q', '13-17');
        const adultPrompt = buildRephraseQuestionPrompt('Q', '35+');

        expect(teenPrompt).not.toBe(adultPrompt);
    });
});

describe('buildDiversifiedCheckInPrompt', () => {
    it('includes recent phrasings as a do-not-repeat instruction when provided', () => {
        const prompt = buildDiversifiedCheckInPrompt(
            'How are you feeling?',
            '18-24',
            [],
            ['How are you doing today?']
        );

        expect(prompt).toContain('Do NOT reuse wording');
        expect(prompt).toContain('How are you doing today?');
    });

    it('omits the do-not-repeat instruction when there are no recent phrasings', () => {
        const prompt = buildDiversifiedCheckInPrompt('How are you feeling?', '18-24', [], []);

        expect(prompt).not.toContain('Do NOT reuse wording');
    });

    it('includes mood history with the strict no-diagnosis guardrail when provided', () => {
        const prompt = buildDiversifiedCheckInPrompt(
            'How are you feeling?',
            '18-24',
            ['tired', 'tired', 'okay'],
            []
        );

        expect(prompt).toContain('tired, tired, okay');
        expect(prompt.toLowerCase()).toContain('never diagnose');
    });

    it('omits mood-history instructions entirely when there is no history', () => {
        const prompt = buildDiversifiedCheckInPrompt('How are you feeling?', '18-24', [], []);

        expect(prompt.toLowerCase()).not.toContain('never diagnose');
    });
});

describe('SYSTEM_PROMPT', () => {
    it('constrains the model to rephrasing only, with no opinions', () => {
        expect(SYSTEM_PROMPT.toLowerCase()).toContain('rephrasing');
        expect(SYSTEM_PROMPT.toLowerCase()).toContain('never');
    });
});