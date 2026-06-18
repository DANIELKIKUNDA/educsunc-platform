import type { PublierEvenementTempsReelCommand } from '../../application';
import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerDispatchRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public async executer(
    commande: PublierEvenementTempsReelCommand,
  ): Promise<ResultatWorkerRealtime> {
    const resultat = await this.runtime.broadcast.diffusion.publier(commande);
    return {
      worker: 'DISPATCH',
      succes: true,
      resultat,
    };
  }
}
