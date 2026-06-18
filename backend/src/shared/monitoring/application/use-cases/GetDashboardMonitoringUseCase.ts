import { ServiceCalculEtatSysteme, TableauBordMonitoring } from '../../domain';
import type { GetDashboardMonitoringQuery } from '../queries';
import type { DashboardMonitoringDto } from '../dto/output';
import { DashboardMonitoringMapper, MonitoringContextMapper } from '../mappers';
import type { MonitoringAlertPort, MonitoringHealthPort, MonitoringIncidentPort, MonitoringMetricsPort } from '../ports';

// Ce fichier declare le use case de lecture du tableau de bord Monitoring.

/** Cette classe orchestre la lecture applicative du tableau de bord Monitoring. */
export class GetDashboardMonitoringUseCase {
  constructor(
    private readonly healthPort: MonitoringHealthPort,
    private readonly alertPort: MonitoringAlertPort,
    private readonly incidentPort: MonitoringIncidentPort,
    private readonly metricsPort: MonitoringMetricsPort,
    private readonly contexteMapper = new MonitoringContextMapper(),
    private readonly calculEtat = new ServiceCalculEtatSysteme(),
    private readonly mapper = new DashboardMonitoringMapper(),
  ) {}

  /** Cette methode execute la lecture du tableau de bord. */
  public async executer(query: GetDashboardMonitoringQuery): Promise<DashboardMonitoringDto> {
    const composants = await this.healthPort.collecterComposants(query.contexte);
    const dependances = await this.healthPort.collecterDependances(query.contexte);
    const runtime = await this.healthPort.collecterRuntime(query.contexte);
    const etat = this.calculEtat.calculer(this.contexteMapper.versContexte(query.contexte), composants, dependances, runtime);
    const tableauBord = new TableauBordMonitoring(
      etat,
      await this.alertPort.listerAlertes(),
      await this.incidentPort.listerIncidents(),
      await this.incidentPort.listerDiagnostics(),
      await this.metricsPort.listerCapacites(),
      await this.metricsPort.listerSaturations(),
    );
    return this.mapper.versDto(tableauBord);
  }
}
