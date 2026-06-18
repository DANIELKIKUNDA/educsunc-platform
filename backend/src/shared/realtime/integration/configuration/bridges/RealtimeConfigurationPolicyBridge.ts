import type { RealtimeConfigurationProjection } from '../RealtimeConfigurationIntegrationTypes';

type MutableRealtimeConfigurationProjection = {
  -readonly [K in keyof RealtimeConfigurationProjection]: RealtimeConfigurationProjection[K];
};

const projectionCourante: MutableRealtimeConfigurationProjection = {
  canauxAutorises: [],
  offlineFirst: true,
};

export class RealtimeConfigurationPolicyBridge {
  public lireProjection(): RealtimeConfigurationProjection {
    return {
      canauxAutorises: [...projectionCourante.canauxAutorises],
      offlineFirst: projectionCourante.offlineFirst,
    };
  }

  public appliquerProjection(projection: RealtimeConfigurationProjection): void {
    projectionCourante.canauxAutorises = [...projection.canauxAutorises];
    projectionCourante.offlineFirst = projection.offlineFirst;
  }
}
