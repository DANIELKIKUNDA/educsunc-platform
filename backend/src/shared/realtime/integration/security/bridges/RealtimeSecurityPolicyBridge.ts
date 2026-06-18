import type { RealtimeSecurityProjection } from '../RealtimeSecurityIntegrationTypes';

type MutableRealtimeSecurityProjection = {
  -readonly [K in keyof RealtimeSecurityProjection]: RealtimeSecurityProjection[K];
};

const projectionCourante: MutableRealtimeSecurityProjection = {
  autorise: true,
  scopes: [],
  permissions: [],
};

export class RealtimeSecurityPolicyBridge {
  public lireProjection(): RealtimeSecurityProjection {
    return {
      autorise: projectionCourante.autorise,
      scopes: [...projectionCourante.scopes],
      permissions: [...projectionCourante.permissions],
    };
  }

  public appliquerProjection(projection: RealtimeSecurityProjection): void {
    projectionCourante.autorise = projection.autorise;
    projectionCourante.scopes = [...projection.scopes];
    projectionCourante.permissions = [...projection.permissions];
  }
}
