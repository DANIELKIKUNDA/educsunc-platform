import { PostgresAuditOperationalReader } from '../../persistence/postgres/repositories/PostgresAuditOperationalReader';
import { obtenirAuditEventMemoryStore } from '../../event-bus';
import type { AuditHealthCheckResult } from '../MonitoringTypes';

// Les health checks restent rapides, fiables et directement exploitables par l orchestration.
export class AuditHealthCheckService {
  public constructor(private readonly reader = new PostgresAuditOperationalReader()) {}

  public async verifier(): Promise<AuditHealthCheckResult[]> {
    const bus = obtenirAuditEventMemoryStore();

    return [
      { statut: 'OK', composant: 'DB_AUDIT', message: `Entries=${await this.reader.compterEntrees()}` },
      { statut: 'OK', composant: 'EVENT_BUS_AUDIT', message: `Events=${bus.events.length}` },
      { statut: bus.deadLetters.length > 0 ? 'DEGRADE' : 'OK', composant: 'DEAD_LETTER_AUDIT', message: `DeadLetters=${bus.deadLetters.length}` },
      { statut: 'OK', composant: 'PROJECTIONS_AUDIT', message: `Projections=${await this.reader.compterDocuments('PROJECTION')}` },
      { statut: 'OK', composant: 'EXPORTS_AUDIT', message: `Exports=${await this.reader.compterDocuments('EXPORT')}` },
      { statut: 'OK', composant: 'STORAGE_AUDIT', message: `ColdPackages=${await this.reader.compterDocuments('COLD_STORAGE')}` },
    ];
  }
}
