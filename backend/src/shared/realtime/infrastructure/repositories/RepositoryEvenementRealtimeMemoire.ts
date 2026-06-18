import type { EvenementTempsReel, PortRepositoryEvenementRealtime } from '../../domain';
import { StockageEvenementsRealtimeMemoire } from '../persistence';

export class RepositoryEvenementRealtimeMemoire implements PortRepositoryEvenementRealtime {
  private readonly store = new StockageEvenementsRealtimeMemoire().obtenirStore();

  public async sauvegarder(evenement: EvenementTempsReel): Promise<void> {
    this.store.set(evenement.id.value, evenement);
  }

  public async listerDiffusables(): Promise<readonly EvenementTempsReel[]> {
    return [...this.store.values()].filter((evenement) => evenement.peutEtreDiffuse());
  }
}
