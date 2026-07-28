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