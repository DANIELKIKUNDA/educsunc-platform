import type { OuvrirConnexionTempsReelCommand } from '../../application';
import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerConnexionsRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public async executer(
    commande: OuvrirConnexionTempsReelCommand,
  ): Promise<ResultatWorkerRealtime> {
    const resultat = await this.runtime.connections.service.ouvrir(commande);
    this.runtime.connections.registry.enregistrerConnexion(resultat.id);
    return {
      worker: 'CONNECTIONS',
      succes: true,
      resultat,
    };
  }
}
