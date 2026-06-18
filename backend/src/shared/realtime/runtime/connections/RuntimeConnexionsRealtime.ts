import type { OuvrirConnexionTempsReelCommand } from '../../application';
import { FacadeInfrastructureRealtime } from '../../infrastructure';

export class RuntimeConnexionsRealtime {
  constructor(private readonly facade: FacadeInfrastructureRealtime) {}

  public async ouvrir(commande: OuvrirConnexionTempsReelCommand) {
    return this.facade.connexions.ouvrir(commande);
  }

  public async fermer(connexionId: string) {
    return this.facade.connexions.fermer({ connexionId });
  }

  public async reconnecter(connexionId: string) {
    return this.facade.connexions.reconnecter({ connexionId });
  }
}
