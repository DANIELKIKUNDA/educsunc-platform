import type { AbonnerConnexionTempsReelCommand } from '../../application';
import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerAbonnementsRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public async executer(
    commande: AbonnerConnexionTempsReelCommand,
  ): Promise<ResultatWorkerRealtime> {
    const resultat = await this.runtime.subscriptions.service.abonner(commande);
    this.runtime.subscriptions.projection.enregistrerAbonnement(resultat.id);
    return {
      worker: 'SUBSCRIPTIONS',
      succes: true,
      resultat,
    };
  }
}
