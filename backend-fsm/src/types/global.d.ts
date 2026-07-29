import type { EncryptedPayload } from "@security/crypto.services";
export interface UserProfile {
    id: string;
    displayName: string;
    ageRange: '13-17' | '18-24' | '25-34' | '35+';
    createdAt: number;
    themePreference: 'companion' | 'aesthetic'
}

export interface CheckInRecord {
    id: string;
    profileId: string;
    timestamp: number;
    mood: string;
    notes?: string
}

export interface FsmSnapshot {
    id: string;
    profileId: string;
    savedAt: number;
    serializedState: string;
}

export interface StoredProfile {
    id: string;
    displayName: EncryptedPayload;
    ageRange: EncryptedPayload;
    createdAt: number;
    themePreference: UserProfile['themePreference'];
}

export interface StoredCheckInRecord {
    id: string,
    profileId: string,
    timestamp: number,
    mood: EncryptedPayload,
    notes: EncryptedPayload | null
}

export interface StoredFsmSnapshot {
    id: string,
    profileId: string,
    savedAt: number
    serializedState: EncryptedPayload
}