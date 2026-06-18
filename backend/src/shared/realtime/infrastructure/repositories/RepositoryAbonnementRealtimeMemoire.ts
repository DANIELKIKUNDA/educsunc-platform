import type { AbonnementTempsReel, PortRepositoryAbonnementRealtime } from '../../domain';
import { StockageAbonnementsRealtimeMemoire } from '../persistence';

export class RepositoryAbonnementRealtimeMemoire implements PortRepositoryAbonnementRealtime {
  private readonly store = new StockageAbonnementsRealtimeMemoire().obtenirStore();

  public async sauvegarder(abonnement: AbonnementTempsReel): Promise<void> {
    this.store.set(abonnement.id.value, abonnement);
  }

  public async trouverParConnexion(connexionId: string): Promise<readonly AbonnementTempsReel[]> {
    return [...this.store.values()].filter((abonnement) => abonnement.connexionId.value === connexionId);
  }
}
