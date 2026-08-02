export const dbSchema = {
    profiles: 'id',
    checkIns: 'id, profileId, timestamps',
    snapshots: 'id, profileId',
    consentRecords: 'id, profileId, grantedAt'
} as const

export const DB_VERSION = 2;

export const DB_NAME = 'renew-db';