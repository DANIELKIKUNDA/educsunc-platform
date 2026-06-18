import type { RealtimeSynchronisationProjection } from '../RealtimeSynchronisationIntegrationTypes';

type MutableRealtimeSynchronisationProjection = {
  -readonly [K in keyof RealtimeSynchronisationProjection]: RealtimeSynchronisationProjection[K];
};

const projectionCourante: MutableRealtimeSynchronisationProjection = {
  totalSynchronisations: 0,
};

export class RealtimeSynchronisationBridge {
  public lireProjection(): RealtimeSynchronisationProjection {
    return { ...projectionCourante };
  }

  public appliquerProjection(projection: RealtimeSynchronisationProjection): void {
    projectionCourante.dernierEtat = projection.dernierEtat;
    projectionCourante.totalSynchronisations = projection.totalSynchronisations;
  }
}
