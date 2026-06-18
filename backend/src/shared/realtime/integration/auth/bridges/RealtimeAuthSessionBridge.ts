import type { RealtimeAuthProjection } from '../RealtimeAuthIntegrationTypes';

type MutableRealtimeAuthProjection = {
  -readonly [K in keyof RealtimeAuthProjection]: RealtimeAuthProjection[K];
};

const projectionCourante: MutableRealtimeAuthProjection = {
  sessionActive: false,
  permissions: [],
};

export class RealtimeAuthSessionBridge {
  public lireProjection(): RealtimeAuthProjection {
    return { ...projectionCourante, permissions: [...projectionCourante.permissions] };
  }

  public appliquerProjection(projection: RealtimeAuthProjection): void {
    projectionCourante.sessionActive = projection.sessionActive;
    projectionCourante.utilisateurId = projection.utilisateurId;
    projectionCourante.organisationId = projection.organisationId;
    projectionCourante.ecoleId = projection.ecoleId;
    projectionCourante.permissions = [...projection.permissions];
  }
}
