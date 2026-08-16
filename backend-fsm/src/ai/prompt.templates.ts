import type { UserProfile } from "../types/global";

const TONE_BY_AGE_RANGE: Record<UserProfile['ageRange'], string> = {
    '13-17': 'friendly, casual, and simple — like a supportive peer, not clinical',
    '18-24': 'warm, casual, and direct',
    '25-34': 'clear, respectful, and conversational',
    '35+': 'clear, calm, and respectful',
}

export function buildRephraseQuestionPrompt(
    originalQuestion: string,
    ageRange: UserProfile['ageRange']
): string {
    const tone = TONE_BY_AGE_RANGE[ageRange]

    return [
        `Rewrite the following question in a ${tone} tone.`,
        `Keep the EXACT same meaning and intent — do not add, remove, or change what is being asked.`,
        `Do not add any greeting, explanation, or extra commentary.`,
        `Respond with ONLY the rewritten question, nothing else.`,
        ``,
        `Question: "${originalQuestion}"`,
    ].join('\n');
}

export const SYSTEM_PROMPT =
    'You are a rephrasing assistant. You ONLY rewrite questions in a ' +
    'different tone while preserving their exact meaning. You never ' +
    'answer questions, never add opinions, and never include anything ' +
    'other than the rewritten question in your response.';


export function buildDiversifiedCheckInPrompt(
    originalQuestion: string,
    ageRange: UserProfile['ageRange'],
    recentMoods: string[],
    recentPhrasings: string[]
): string {
    const tone = TONE_BY_AGE_RANGE[ageRange];

    const lines = [
        `Rewrite the following question in a ${tone} tone.`,
        `Keep the EXACT same meaning and intent.`,
    ];

    if (recentPhrasings.length > 0) {
        lines.push(
            `Do NOT reuse wording similar to these previous versions: ` +
            recentPhrasings.map((p) => `"${p}"`).join(', ') + '.'
        );
    }

    if (recentMoods.length > 0) {
        lines.push(
            `The user's last few logged moods, in their own words, were: ` +
            recentMoods.join(', ') + '.',
            `You may gently acknowledge this ONLY by reflecting their own ` +
            `words back neutrally (e.g. "you've mentioned feeling tired ` +
            `lately"). NEVER diagnose, interpret, guess a cause, or use ` +
            `clinical/medical language. If unsure, do not mention the ` +
            `pattern at all — just rephrase the question normally.`
        );
    }

    lines.push(
        `Do not add any greeting, explanation, or extra commentary.`,
        `Respond with ONLY the rewritten question, nothing else.`,
        ``,
        `Question: "${originalQuestion}"`
    );

    return lines.join('\n');
}