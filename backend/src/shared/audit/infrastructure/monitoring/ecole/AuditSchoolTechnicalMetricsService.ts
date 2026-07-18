import { PostgresAuditEntryRepository } from '../../persistence/postgres/repositories/PostgresAuditEntryRepository';
import { AuditTraceService } from '../traces/AuditTraceService';
import type { AuditMetricPoint } from '../MonitoringTypes';

interface AuditSchoolTechnicalFilters {
  readonly organisationId: string;
  readonly ecoleId: string;
}

// Ce service calcule une vue technique locale sans exposer les snapshots globaux plateforme.
export class AuditSchoolTechnicalMetricsService {
  public constructor(
    private readonly traces = new AuditTraceService(),
    private readonly entries = new PostgresAuditEntryRepository(),
  ) {}

  public async collecter(filtres: AuditSchoolTechnicalFilters): Promise<AuditMetricPoint[]> {
    const horodatage = new Date().toISOString();
    const entrees = await this.entries.listerSelonFiltres(filtres);
    const traces = this.traces.lister(filtres);

    return [
      { nom: 'audit_school_entries_total', valeur: entrees.length, horodatage },
      { nom: 'audit_school_traces_total', valeur: traces.length, horodatage },
      {
        nom: 'audit_school_system_entries_total',
        valeur: entrees.filter((entree) =>
          entree.obtenirTypeAuditPrincipal().obtenirValeur() === 'SYSTEME'
          || entree.obtenirCategoriesAudit().some((categorie) => categorie.obtenirValeur() === 'SYSTEME'),
        ).length,
        horodatage,
      },
      {
        nom: 'audit_school_worker_traces_total',
        valeur: traces.filter((trace) => trace.workerId || trace.queueName).length,
        horodatage,
      },
    ];
  }
}
