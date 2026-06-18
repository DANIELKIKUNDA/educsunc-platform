import {
  FacadeInfrastructureRealtime,
  WorkerDiffusionRealtime,
  WorkerObservabiliteRealtime,
} from 'shared/realtime';

export class RealtimeTestSupport {
  public static creerEnvironnement() {
    const facade = new FacadeInfrastructureRealtime();
    return {
      facade,
      services: {
        diffusion: facade.diffusion,
        connexions: facade.connexions,
        abonnements: facade.abonnements,
        etat: facade.etat,
      },
      workers: {
        diffusion: new WorkerDiffusionRealtime(),
        observabilite: new WorkerObservabiliteRealtime(),
      },
    };
  }
}
