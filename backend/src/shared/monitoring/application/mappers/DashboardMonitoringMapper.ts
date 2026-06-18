import { TableauBordMonitoring } from '../../domain';
import type { DashboardMonitoringDto } from '../dto/output';

// Ce fichier declare le mapper de tableau de bord Monitoring.

/** Cette classe transforme un tableau de bord domaine en DTO applicatif. */
export class DashboardMonitoringMapper {
  /** Cette methode projette un tableau de bord en DTO. */
  public versDto(tableauBord: TableauBordMonitoring): DashboardMonitoringDto {
    return tableauBord.details();
  }
}
