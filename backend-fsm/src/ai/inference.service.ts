import { getEngine, isWebGpuSupported, type ModelLoadProgressCallback } from './webllm.client';
import {
    buildRephraseQuestionPrompt,
    buildDiversifiedCheckInPrompt,
    SYSTEM_PROMPT,
} from './prompt.templates';
import type { UserProfile } from '../types/global';
import * as checkinRepo from '@db/repositories/checkin.repo';

function isValidRephrase(output: string, originalQuestion: string): boolean {
    const trimmed = output.trim();

    if (trimmed.length === 0) return false;
    if (trimmed.length > originalQuestion.length * 4) return false;

    const lowerOutput = trimmed.toLowerCase();
    if (lowerOutput.includes('rewrite') || lowerOutput.includes('rephrase')) {
        return false;
    }

    return true;
}

function cleanOutput(output: string): string {
    return output.trim().replace(/^["']|["']$/g, '');
}

export async function rephraseQuestion(
    originalQuestion: string,
    ageRange: UserProfile['ageRange'],
    onProgress?: ModelLoadProgressCallback
): Promise<string> {
    if (!isWebGpuSupported()) {
        return originalQuestion;
    }

    try {
        const engine = await getEngine(onProgress);

        const response = await engine.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: buildRephraseQuestionPrompt(originalQuestion, ageRange) },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        const rawOutput = response.choices[0]?.message?.content ?? '';
        const cleaned = cleanOutput(rawOutput);

        if (!isValidRephrase(cleaned, originalQuestion)) {
            return originalQuestion;
        }

        return cleaned;
    } catch (error) {
        console.warn('[inference.service] Rephrase failed, using original question:', error);
        return originalQuestion;
    }
}

const recentPhrasingsByProfile = new Map<string, string[]>();
const MAX_TRACKED_PHRASINGS = 3;
const MAX_MOOD_HISTORY = 5;

function trackPhrasing(profileId: string, phrasing: string): void {
    const existing = recentPhrasingsByProfile.get(profileId) ?? [];
    const updated = [...existing, phrasing].slice(-MAX_TRACKED_PHRASINGS);
    recentPhrasingsByProfile.set(profileId, updated);
}

export async function getDiversifiedCheckInQuestion(
    originalQuestion: string,
    profileId: string,
    ageRange: UserProfile['ageRange'],
    onProgress?: ModelLoadProgressCallback
): Promise<string> {
    if (!isWebGpuSupported()) {
        return originalQuestion;
    }

    try {
        const history = await checkinRepo.getAllForProfile(profileId);
        const recentMoods = history.slice(0, MAX_MOOD_HISTORY).map((c) => c.mood).reverse();
        const recentPhrasings = recentPhrasingsByProfile.get(profileId) ?? [];

        const engine = await getEngine(onProgress);

        const response = await engine.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: buildDiversifiedCheckInPrompt(originalQuestion, ageRange, recentMoods, recentPhrasings),
                },
            ],
            temperature: 0.8, // slightly higher than plain rephrase, to encourage variety
            max_tokens: 100,
        });

        const rawOutput = response.choices[0]?.message?.content ?? '';
        const cleaned = cleanOutput(rawOutput);

        if (!isValidRephrase(cleaned, originalQuestion)) {
            return originalQuestion;
        }

        trackPhrasing(profileId, cleaned);
        return cleaned;
    } catch (error) {
        console.warn('[inference.service] Diversified question failed, using original:', error);
        return originalQuestion;
    }
}