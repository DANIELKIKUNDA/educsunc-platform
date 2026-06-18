import type { AbonnerConnexionTempsReelCommand } from '../../application';
import { FacadeInfrastructureRealtime } from '../../infrastructure';

export class RuntimeAbonnementsRealtime {
  constructor(private readonly facade: FacadeInfrastructureRealtime) {}

  public async abonner(commande: AbonnerConnexionTempsReelCommand) {
    return this.facade.abonnements.abonner(commande);
  }

  public async desabonner(connexionId: string, canal: string) {
    return this.facade.abonnements.desabonner({ connexionId, canal });
  }
}
