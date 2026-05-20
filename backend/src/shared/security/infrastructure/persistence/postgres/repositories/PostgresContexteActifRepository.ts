import type { ContexteActifRepositoryPort } from '../../../../application';
import type { ContexteActifUtilisateur } from '../../../../domain';
import { ContexteActifPersistenceMapper } from '../mappers';
import { obtenirMemoireSecurityStore } from './_memoireSecurityStore';

// Ce depot persiste le contexte actif courant des utilisateurs.
export class PostgresContexteActifRepository implements ContexteActifRepositoryPort {
  public async sauvegarder(contexteActifUtilisateur: ContexteActifUtilisateur): Promise<void> {
    const store = obtenirMemoireSecurityStore();
    const record = ContexteActifPersistenceMapper.versRecord(contexteActifUtilisateur);
    store.contextesActifs.set(record.id_utilisateur, record);
  }

  public async trouverParUtilisateur(idUtilisateur: string): Promise<ContexteActifUtilisateur | null> {
    const record = obtenirMemoireSecurityStore().contextesActifs.get(idUtilisateur);
    return record ? ContexteActifPersistenceMapper.depuisRecord(record) : null;
  }
}
