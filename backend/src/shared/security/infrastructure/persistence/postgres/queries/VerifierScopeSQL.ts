import type { VerifierScopeQuery } from '../../../../application';
import { obtenirMemoireSecurityStore } from '../repositories/_memoireSecurityStore';

// Cette query verifie si l'utilisateur reste dans son perimetre organisation/ecole.
export class VerifierScopeSQL implements VerifierScopeQuery {
  public async executer(idUtilisateur: string, idOrganisation?: string, idEcole?: string): Promise<boolean> {
    const affectations = Array.from(obtenirMemoireSecurityStore().affectations.values())
      .filter((record) => record.id_utilisateur === idUtilisateur && record.etat_affectation === 'ACTIVE');

    return affectations.some((affectation) =>
      (idOrganisation === undefined || affectation.id_organisation === idOrganisation) &&
      (idEcole === undefined || affectation.id_ecole === idEcole || affectation.id_ecole === undefined),
    );
  }
}
