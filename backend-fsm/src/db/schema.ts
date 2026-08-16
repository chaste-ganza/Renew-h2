export const dbSchema = {
    profiles: 'id',
    checkins: 'id, profileId, timestamp',
    snapshots: 'id, profileId',
    consentRecords: 'id, profileId, grantedAt'
} as const

export const DB_VERSION = 2;

export const DB_NAME = 'renew-db';