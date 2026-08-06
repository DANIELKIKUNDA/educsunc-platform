import Dexie, { type EntityTable } from 'dexie';
import {
  OFFLINE_DATABASE_NAME,
  OFFLINE_DATABASE_SCHEMA_V1,
  OFFLINE_DATABASE_VERSION,
  type OfflineConflictRecord,
  type OfflineEncryptionKeyRecord,
  type OfflineMetadataRecord,
  type OfflineOperationRecord,
} from './schema';

export class EduSyncLocalDatabase extends Dexie {
  public operations!: EntityTable<OfflineOperationRecord, 'id'>;
  public conflicts!: EntityTable<OfflineConflictRecord, 'id'>;
  public encryptionKeys!: EntityTable<OfflineEncryptionKeyRecord, 'partitionKey'>;
  public metadata!: EntityTable<OfflineMetadataRecord, 'key'>;

  public constructor(name = OFFLINE_DATABASE_NAME) {
    super(name);
    this.version(OFFLINE_DATABASE_VERSION).stores(OFFLINE_DATABASE_SCHEMA_V1);

    this.on('versionchange', () => {
      this.close();
    });
  }
}

export const offlineDatabase = new EduSyncLocalDatabase();

export async function purgeOfflineDatabase(database: EduSyncLocalDatabase = offlineDatabase): Promise<void> {
  database.close();
  await Dexie.delete(database.name);
  // Dexie désactive l'ouverture automatique après close(); la base vide doit
  // rester réutilisable si un autre utilisateur se connecte dans le même onglet.
  await database.open();
}

export {
  OFFLINE_DATABASE_NAME,
  OFFLINE_DATABASE_SCHEMA_V1,
  OFFLINE_DATABASE_VERSION,
};
export type {
  OfflineConflictRecord,
  OfflineEncryptionKeyRecord,
  OfflineMetadataRecord,
  OfflineOperationRecord,
  OfflineOperationStatus,
  OfflineOperationType,
} from './schema';
