import { obtenirMemoireAuditStore } from '../../persistence/postgres/repositories/_memoireAuditStore';
import { obtenirAuditEventMemoryStore } from '../../event-bus';
import type { AuditHealthCheckResult } from '../MonitoringTypes';

// Les health checks restent rapides, fiables et directement exploitables par l orchestration.
export class AuditHealthCheckService {
  public verifier(): AuditHealthCheckResult[] {
    const store = obtenirMemoireAuditStore();
    const bus = obtenirAuditEventMemoryStore();

    return [
      { statut: 'OK', composant: 'DB_AUDIT', message: `Entries=${store.auditEntries.size}` },
      { statut: 'OK', composant: 'EVENT_BUS_AUDIT', message: `Events=${bus.events.length}` },
      { statut: bus.deadLetters.length > 0 ? 'DEGRADE' : 'OK', composant: 'DEAD_LETTER_AUDIT', message: `DeadLetters=${bus.deadLetters.length}` },
      { statut: 'OK', composant: 'PROJECTIONS_AUDIT', message: `Projections=${store.auditProjections.size}` },
      { statut: 'OK', composant: 'EXPORTS_AUDIT', message: `Exports=${store.auditExports.size}` },
      { statut: 'OK', composant: 'STORAGE_AUDIT', message: `ColdPackages=${store.auditColdStoragePackages.size}` },
    ];
  }
}
