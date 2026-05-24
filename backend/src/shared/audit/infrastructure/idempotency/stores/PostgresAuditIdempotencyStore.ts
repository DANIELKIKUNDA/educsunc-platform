import type { AuditIdempotencyRepository } from '../../../domain/repositories';
import { PostgresAuditIdempotencyRepository } from '../../persistence/postgres/repositories';
import type {
  AuditIdempotencyMonitoringSnapshot,
  AuditIdempotencyRegistration,
} from '../IdempotencyTypes';

type AuditIdempotencyStoreState = {
  metadataByKey: Map<string, AuditIdempotencyRegistration>;
  activeLocks: Set<string>;
  collisionCount: number;
  deadLetterCount: number;
  duplicateIgnoredCount: number;
};

const state: AuditIdempotencyStoreState = {
  metadataByKey: new Map<string, AuditIdempotencyRegistration>(),
  activeLocks: new Set<string>(),
  collisionCount: 0,
  deadLetterCount: 0,
  duplicateIgnoredCount: 0,
};

// Ce store unifie la persistance dediee et les metadonnees riches necessaires au replay/retry.
export class PostgresAuditIdempotencyStore {
  public constructor(
    private readonly repository: AuditIdempotencyRepository = new PostgresAuditIdempotencyRepository(),
  ) {}

  public async existe(cleIdempotence: string): Promise<boolean> {
    return this.repository.estDejaTraitee(cleIdempotence);
  }

  public async retrouver(cleIdempotence: string): Promise<AuditIdempotencyRegistration | null> {
    const metadata = state.metadataByKey.get(cleIdempotence);
    if (metadata) {
      return metadata;
    }

    const persisted = await this.repository.retrouverCle(cleIdempotence);
    if (!persisted) {
      return null;
    }

    return {
      cleIdempotence: persisted.cleIdempotence,
      idAuditEntry: persisted.idAuditEntry,
      dateTraitement: persisted.dateCreation,
      nature: persisted.estReplay ? 'REPLAY' : persisted.estRetry ? 'RETRY' : 'ORIGINAL',
      sourceTraitement: 'PERSISTENCE_AUDIT',
      statutTraitement: 'TRAITE',
      retryCount: persisted.estRetry ? 1 : 0,
      historiqueRetry: [],
    };
  }

  public async enregistrer(enregistrement: AuditIdempotencyRegistration): Promise<void> {
    state.metadataByKey.set(enregistrement.cleIdempotence, enregistrement);
    await this.repository.enregistrerCle({
      cleIdempotence: enregistrement.cleIdempotence,
      idAuditEntry: enregistrement.idAuditEntry,
      dateCreation: enregistrement.dateTraitement,
      estReplay: enregistrement.nature === 'REPLAY',
      estRetry: enregistrement.nature === 'RETRY',
    });
  }

  public verrouiller(cleIdempotence: string): boolean {
    if (state.activeLocks.has(cleIdempotence)) {
      state.collisionCount += 1;
      return false;
    }

    state.activeLocks.add(cleIdempotence);
    return true;
  }

  public liberer(cleIdempotence: string): void {
    state.activeLocks.delete(cleIdempotence);
  }

  public incrementerCollision(): void {
    state.collisionCount += 1;
  }

  public marquerDoublonIgnore(): void {
    state.duplicateIgnoredCount += 1;
  }

  public marquerDeadLetter(): void {
    state.deadLetterCount += 1;
  }

  public snapshotMonitoring(): AuditIdempotencyMonitoringSnapshot {
    let totalReplays = 0;
    let totalRetries = 0;

    for (const metadata of state.metadataByKey.values()) {
      if (metadata.nature === 'REPLAY') {
        totalReplays += 1;
      }

      if (metadata.nature === 'RETRY') {
        totalRetries += 1;
      }
    }

    return {
      totalCles: state.metadataByKey.size,
      totalReplays,
      totalRetries,
      totalDoublonsIgnores: state.duplicateIgnoredCount,
      totalCollisions: state.collisionCount,
      totalDeadLetters: state.deadLetterCount,
      totalLocksActifs: state.activeLocks.size,
    };
  }
}
