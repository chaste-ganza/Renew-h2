import Dexie, { type Table } from 'dexie';
import { dbSchema, DB_NAME, DB_VERSION } from './schema';
import type { UserProfiles, CheckInRecord, FsmSnapshot } from '../types/global';

class RenewDatabase extends Dexie {
    profiles!: Table<UserProfiles, string>;
    checkins!: Table<CheckInRecord, string>;
    snapshots!: Table<FsmSnapshot, string>;

    constructor() {
        super(DB_NAME);
        this.version(DB_VERSION).stores(dbSchema);
    }
}
export const db = new RenewDatabase();