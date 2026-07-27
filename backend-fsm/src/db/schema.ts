export const dbSchema = {
    profiles: 'id',
    checkIns: 'id, profileId, timestamps',
    snapshots: 'id, profileId',
} as const

export const DB_VERSION = 1;

export const DB_NAME = 'renew-db';