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