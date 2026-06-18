import type {
  RealtimeMonitoringEvenement,
  RealtimeMonitoringProjection,
} from '../RealtimeMonitoringIntegrationTypes';

export class RealtimeMonitoringMapper {
  public static appliquer(
    projection: RealtimeMonitoringProjection,
    evenement: RealtimeMonitoringEvenement,
  ): RealtimeMonitoringProjection {
    return {
      totalSignaux: projection.totalSignaux + 1,
      dernierType: `${evenement.canal}:${evenement.type}`,
    };
  }
}
