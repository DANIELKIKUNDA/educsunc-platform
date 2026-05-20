import type { VerifierRestrictionQuery } from '../../../../application';
import { obtenirMemoireSecurityStore } from '../repositories/_memoireSecurityStore';

// Cette query detecte la presence d'une restriction metier sur les roles actifs d'un utilisateur.
export class VerifierRestrictionSQL implements VerifierRestrictionQuery {
  public async executer(idUtilisateur: string, codeRestriction: string): Promise<boolean> {
    const store = obtenirMemoireSecurityStore();
    const affectations = Array.from(store.affectations.values())
      .filter((record) => record.id_utilisateur === idUtilisateur && record.etat_affectation === 'ACTIVE');

    return affectations.some((affectation) => {
      const role = store.roles.get(affectation.id_role);
      return role ? role.restrictions.some((restriction) => restriction.code_restriction === codeRestriction) : false;
    });
  }
}
