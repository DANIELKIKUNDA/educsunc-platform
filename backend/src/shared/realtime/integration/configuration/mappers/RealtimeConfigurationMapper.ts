import type {
  RealtimeConfigurationEvenement,
  RealtimeConfigurationProjection,
} from '../RealtimeConfigurationIntegrationTypes';

export class RealtimeConfigurationMapper {
  public static appliquer(
    _projection: RealtimeConfigurationProjection,
    evenement: RealtimeConfigurationEvenement,
  ): RealtimeConfigurationProjection {
    return {
      canauxAutorises: [...evenement.canauxAutorises],
      offlineFirst: evenement.offlineFirst,
    };
  }
}
