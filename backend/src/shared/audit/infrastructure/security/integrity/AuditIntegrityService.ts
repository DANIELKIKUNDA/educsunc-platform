import { PostgresAuditEntryRepository } from '../../persistence/postgres/repositories/PostgresAuditEntryRepository';
import type { AuditIntegritySnapshot } from '../SecurityTypes';
import { PostgresAuditIntegrityStore } from './PostgresAuditIntegrityStore';

// L integrite historique protege la verite append-only contre la corruption silencieuse.
export class AuditIntegrityService {
  public constructor(
    private readonly entries = new PostgresAuditEntryRepository(),
    private readonly integrity = new PostgresAuditIntegrityStore(),
  ) {}

  public async verifierEntree(idAuditEntry: string) {
    return this.integrity.verifier(idAuditEntry);
  }

  public async verifier(): Promise<AuditIntegritySnapshot> {
    const anomalies: string[] = [];
    let totalEmpreintes = 0;
    const entries = await this.entries.listerSelonFiltres({});

    for (const entry of entries) {
      const verification = await this.integrity.verifier(entry.obtenirId());
      if (verification.statut === 'VALID' || verification.statut === 'CORRUPTED') totalEmpreintes += 1;
      if (verification.statut === 'CORRUPTED') anomalies.push(`INTEGRITY_MISMATCH:${entry.obtenirId()}`);
    }

    return { totalEntries: entries.length, totalEmpreintes, anomalies };
  }
}
