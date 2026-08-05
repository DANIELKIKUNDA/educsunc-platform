export type OfflineOperationType = 'ENCODER_COTE' | 'MODIFIER_COTE';

export type OfflineOperationStatus =
  | 'PENDING'
  | 'SYNCING'
  | 'RETRY'
  | 'CONFLICT'
  | 'REJECTED';

export interface OfflineOperationRecord {
  id: string;
  idempotencyKey: string;
  partitionKey: string;
  operationType: OfflineOperationType;
  encryptedPayload: string;
  initializationVector: string;
  encryptionVersion: 1;
  status: OfflineOperationStatus;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  nextAttemptAt: string;
  lastErrorCode?: string;
  lastErrorMessage?: string;
}

export interface OfflineConflictRecord {
  id: string;
  operationId: string;
  partitionKey: string;
  operationType: OfflineOperationType;
  status: 'OPEN' | 'RESOLVED';
  message: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface OfflineEncryptionKeyRecord {
  partitionKey: string;
  key: CryptoKey;
  createdAt: string;
}

export interface OfflineMetadataRecord {
  key: string;
  value: string;
  updatedAt: string;
}

export const OFFLINE_DATABASE_NAME = 'educsyn-local';
export const OFFLINE_DATABASE_VERSION = 1;

export const OFFLINE_DATABASE_SCHEMA_V1 = {
  operations:
    '&id,&idempotencyKey,partitionKey,status,operationType,createdAt,nextAttemptAt,[partitionKey+status],[partitionKey+createdAt]',
  conflicts: '&id,&operationId,partitionKey,status,createdAt,[partitionKey+status]',
  encryptionKeys: '&partitionKey,createdAt',
  metadata: '&key,updatedAt',
} as const;
