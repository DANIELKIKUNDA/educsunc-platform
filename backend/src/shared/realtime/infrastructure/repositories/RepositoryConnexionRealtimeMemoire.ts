import type { ConnexionTempsReel, PortRepositoryConnexionRealtime } from '../../domain';
import { StockageConnexionsRealtimeMemoire } from '../persistence';

export class RepositoryConnexionRealtimeMemoire implements PortRepositoryConnexionRealtime {
  private readonly store = new StockageConnexionsRealtimeMemoire().obtenirStore();

  public async sauvegarder(connexion: ConnexionTempsReel): Promise<void> {
    this.store.set(connexion.id.value, connexion);
  }

  public async trouverParId(id: string): Promise<ConnexionTempsReel | null> {
    return this.store.get(id) ?? null;
  }
}
