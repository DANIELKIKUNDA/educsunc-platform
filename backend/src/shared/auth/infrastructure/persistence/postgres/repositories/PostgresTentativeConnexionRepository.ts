import { DepotTentativeConnexion, TentativeConnexion } from '../../../../domain';
import { TentativeConnexionPersistenceMapper } from '../mappers';
import { obtenirMemoireAuthStore } from './_memoireAuthStore';

// Ce depot persiste les tentatives de connexion AUTH.
export class PostgresTentativeConnexionRepository implements DepotTentativeConnexion {
  private readonly store = obtenirMemoireAuthStore();

  public async sauvegarder(tentativeConnexion: TentativeConnexion): Promise<void> {
    this.store.tentatives.push(TentativeConnexionPersistenceMapper.versRecord(tentativeConnexion));
  }

  public async listerTentativesUtilisateur(idUtilisateur: string): Promise<readonly TentativeConnexion[]> {
    const records = this.store.tentatives.filter((record) => record.email.includes(String(idUtilisateur || '').trim()));
    return records.map((record) => TentativeConnexionPersistenceMapper.depuisRecord(record));
  }
}
