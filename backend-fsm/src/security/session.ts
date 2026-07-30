import { deriveKeyFromPassphrase, setSessionKey, generateSalt, clearSessionKey } from './keyManager';
import { bufferToBase64, base64ToBuffer } from './crypto.services';
import * as profileRepo from '@db/repositories/profile.repo';
import type { UserProfile } from '../types/global';

export async function beginNewSession(passphrase: string): Promise<{ saltBase64: string }> {
    const salt = generateSalt();
    const key = await deriveKeyFromPassphrase(passphrase, salt);
    setSessionKey(key);
    return { saltBase64: bufferToBase64(salt.buffer as ArrayBuffer) };
}

export async function unlockExistingSession(
    profileId: string,
    passphrase: string,
    saltBase64: string
): Promise<UserProfile> {
    const saltBuffer = base64ToBuffer(saltBase64);
    const key = await deriveKeyFromPassphrase(passphrase, new Uint8Array(saltBuffer));
    setSessionKey(key);

    const profile = await profileRepo.getById(profileId);
    if (!profile) {
        clearSessionKey();
        throw new Error('Profile not found for the given id.');
    }

    return profile;
}

export function endSession(): void {
    clearSessionKey();
}