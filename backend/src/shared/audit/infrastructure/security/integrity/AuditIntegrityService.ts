import { createHash } from 'node:crypto';
import { obtenirMemoireAuditStore } from '../../persistence/postgres/repositories/_memoireAuditStore';
import type { AuditIntegritySnapshot } from '../SecurityTypes';

const empreintes = new Map<string, string>();

function calculerEmpreinte(payload: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

// L intégrité historique protège la vérité append-only contre la corruption silencieuse.
export class AuditIntegrityService {
  public scellerEntree(idAuditEntry: string, payload: Record<string, unknown>): string {
    const empreinte = calculerEmpreinte(payload);
    empreintes.set(idAuditEntry, empreinte);
    return empreinte;
  }

  public verifier(): AuditIntegritySnapshot {
    const store = obtenirMemoireAuditStore();
    const anomalies: string[] = [];

    for (const entry of store.auditEntries.values()) {
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
      totalEntries: store.auditEntries.size,
      totalEmpreintes: empreintes.size,
      anomalies,
    };
  }
}
