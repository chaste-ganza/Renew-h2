import Dexie, { type Table } from 'dexie';
import { dbSchema, DB_NAME, DB_VERSION } from './schema';
import type { StoredProfile, StoredCheckInRecord, StoredFsmSnapshot } from '../types/global';

class RenewDatabase extends Dexie {
    profiles!: Table<StoredProfile, string>;
    checkins!: Table<StoredCheckInRecord, string>;
    snapshots!: Table<StoredFsmSnapshot, string>;

    constructor() {
        super(DB_NAME);
        this.version(DB_VERSION).stores(dbSchema);
    }
}
export const db = new RenewDatabase();