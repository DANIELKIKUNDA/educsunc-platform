import type { ListerScopesUtilisateurQuery, ScopeUtilisateurReadModel } from '../../../../application';
import { obtenirMemoireSecurityStore } from '../repositories/_memoireSecurityStore';

// Cette query liste les scopes reels accordes a un utilisateur.
export class ListerScopesUtilisateurSQL implements ListerScopesUtilisateurQuery {
  public async executer(idUtilisateur: string): Promise<readonly ScopeUtilisateurReadModel[]> {
    const store = obtenirMemoireSecurityStore();
    const scopes = Array.from(store.affectations.values())
      .filter((record) => record.id_utilisateur === idUtilisateur)
      .flatMap((record) => store.scopes.get(record.id_affectation_utilisateur) ?? []);

    return scopes.map((scope) => ({
      typeScope: scope.type_scope,
      valeurScope: scope.valeur_scope,
      estLectureSeule: scope.est_lecture_seule,
    }));
  }
}
