import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerProjectionAbonnementsRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public executer(abonnementId: string): ResultatWorkerRealtime {
    this.runtime.subscriptions.projection.enregistrerAbonnement(abonnementId);
    return {
      worker: 'SUBSCRIPTIONS_PROJECTION',
      succes: true,
      resultat: {
        abonnementId,
      },
    };
  }
}
