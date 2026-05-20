import type { AffectationUtilisateurRepositoryPort } from '../../../../application';
import type { AffectationUtilisateur } from '../../../../domain';
import { AffectationPersistenceMapper } from '../mappers';
import { obtenirMemoireSecurityStore } from './_memoireSecurityStore';

// Ce depot persiste les affectations utilisateur SECURITY.
export class PostgresAffectationUtilisateurRepository implements AffectationUtilisateurRepositoryPort {
  public async sauvegarder(affectationUtilisateur: AffectationUtilisateur): Promise<void> {
    const store = obtenirMemoireSecurityStore();
    const record = AffectationPersistenceMapper.versRecord(affectationUtilisateur);
    store.affectations.set(record.id_affectation_utilisateur, record);
    store.scopes.set(record.id_affectation_utilisateur, [...record.scopes]);
  }

  public async trouverParId(idAffectationUtilisateur: string): Promise<AffectationUtilisateur | null> {
    const store = obtenirMemoireSecurityStore();
    const record = store.affectations.get(idAffectationUtilisateur);
    if (!record) {
      return null;
    }
    return AffectationPersistenceMapper.depuisRecord({
      ...record,
      scopes: store.scopes.get(idAffectationUtilisateur) ?? [],
    });
  }

  public async listerActivesParUtilisateur(idUtilisateur: string): Promise<readonly AffectationUtilisateur[]> {
    const store = obtenirMemoireSecurityStore();
    return Array.from(store.affectations.values())
      .filter((record) => record.id_utilisateur === idUtilisateur && record.etat_affectation === 'ACTIVE')
      .map((record) => AffectationPersistenceMapper.depuisRecord({
        ...record,
        scopes: store.scopes.get(record.id_affectation_utilisateur) ?? [],
      }));
  }
}
