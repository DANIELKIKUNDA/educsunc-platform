import { ContexteActifAuth, DepotContexteActifAuth } from '../../../../domain';
import { ContexteActifAuthPersistenceMapper } from '../mappers';
import { obtenirMemoireAuthStore } from './_memoireAuthStore';

// Ce depot persiste les contextes actifs AUTH des utilisateurs.
export class PostgresContexteActifAuthRepository implements DepotContexteActifAuth {
  private readonly store = obtenirMemoireAuthStore();

  public async sauvegarder(contexteActif: ContexteActifAuth): Promise<void> {
    const record = ContexteActifAuthPersistenceMapper.versRecord(contexteActif);
    this.store.contextes.set(record.id_utilisateur, record);
  }

  public async trouverContexteUtilisateur(idUtilisateur: string): Promise<ContexteActifAuth | null> {
    const record = this.store.contextes.get(idUtilisateur);
    return record ? ContexteActifAuthPersistenceMapper.depuisRecord(record) : null;
  }
}
