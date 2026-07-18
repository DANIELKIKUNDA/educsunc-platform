import { createHash } from 'node:crypto';
import { PostgresAuditDocumentStore } from '../../persistence/postgres/repositories/PostgresAuditDocumentStore';
import { PostgresAuditEntryRepository } from '../../persistence/postgres/repositories/PostgresAuditEntryRepository';
import type { AuditIntegritySnapshot } from '../SecurityTypes';

function calculerEmpreinte(payload: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

// L intégrité historique protège la vérité append-only contre la corruption silencieuse.
export class AuditIntegrityService {
  public constructor(
    private readonly documents = new PostgresAuditDocumentStore(),
    private readonly entries = new PostgresAuditEntryRepository(),
  ) {}

  public async scellerEntree(idAuditEntry: string, payload: Record<string, unknown>): Promise<string> {
    const empreinte = calculerEmpreinte(payload);
    await this.documents.enregistrer('INTEGRITY_SEAL', idAuditEntry, { idAuditEntry, empreinte });
    return empreinte;
  }

  public async verifier(): Promise<AuditIntegritySnapshot> {
    const anomalies: string[] = [];
    const empreintes = new Map((await this.documents.lister<{ idAuditEntry: string; empreinte: string }>('INTEGRITY_SEAL'))
      .map((sceau) => [sceau.idAuditEntry, sceau.empreinte]));
    const entries = await this.entries.listerSelonFiltres({});

    for (const entry of entries) {
      const payload = {
        id: entry.obtenirId(),
        action: entry.obtenirActionAudit().obtenirValeur(),
        resultat: entry.obtenirResultatAudit().obtenirValeur(),
        dateAction: entry.obtenirHorodatageAudit().obtenirDateAction().toISOString(),
        organisationId: entry.obtenirTenantAudit().obtenirOrganisationId(),
        ecoleId: entry.obtenirTenantAudit().obtenirEcoleId(),
      };
      const empreinte = calculerEmpreinte(payload);
      const attendue = empreintes.get(entry.obtenirId());
      if (attendue && attendue !== empreinte) {
        anomalies.push(`INTEGRITY_MISMATCH:${entry.obtenirId()}`);
      }
    }

    return {
      totalEntries: entries.length,
      totalEmpreintes: empreintes.size,
      anomalies,
    };
  }
}
