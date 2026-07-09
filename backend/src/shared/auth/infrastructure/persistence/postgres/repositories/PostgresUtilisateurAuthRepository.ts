import { DepotUtilisateurAuth, UtilisateurAuth } from '../../../../domain';
import { UtilisateurAuthPersistenceMapper } from '../mappers';
import { obtenirMemoireAuthStore } from './_memoireAuthStore';

// Ce depot persiste les utilisateurs AUTH dans un stockage PostgreSQL ou memoire.
export class PostgresUtilisateurAuthRepository implements DepotUtilisateurAuth {
  private readonly store = obtenirMemoireAuthStore();

  public async sauvegarder(utilisateur: UtilisateurAuth): Promise<void> {
    const recordExistant = this.store.utilisateurs.get(utilisateur.obtenirId());
    if (recordExistant) {
      this.store.utilisateursParEmail.delete(recordExistant.email);
    }

    const record = UtilisateurAuthPersistenceMapper.versRecord(utilisateur);
    this.store.utilisateurs.set(record.id_utilisateur, record);
    this.store.utilisateursParEmail.set(record.email, record.id_utilisateur);
  }

  public async trouverParId(idUtilisateur: string): Promise<UtilisateurAuth | null> {
    const record = this.store.utilisateurs.get(idUtilisateur);
    return record ? UtilisateurAuthPersistenceMapper.depuisRecord(record) : null;
  }

  public async trouverParEmail(email: string): Promise<UtilisateurAuth | null> {
    const idUtilisateur = this.store.utilisateursParEmail.get(String(email || '').trim().toLowerCase());
    return idUtilisateur ? this.trouverParId(idUtilisateur) : null;
  }

  public async existeEmail(email: string): Promise<boolean> {
    return this.store.utilisateursParEmail.has(String(email || '').trim().toLowerCase());
  }
}
