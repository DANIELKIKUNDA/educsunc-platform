import type { VerifierPermissionQuery } from '../../../../application';
import { obtenirMemoireSecurityStore } from '../repositories/_memoireSecurityStore';

// Cette query verifie rapidement si une permission est presente pour un utilisateur.
export class VerifierPermissionSQL implements VerifierPermissionQuery {
  public async executer(idUtilisateur: string, permissionDemandee: string): Promise<boolean> {
    const store = obtenirMemoireSecurityStore();
    const affectations = Array.from(store.affectations.values()).filter((record) => record.id_utilisateur === idUtilisateur && record.etat_affectation === 'ACTIVE');
    return affectations.some((affectation) => {
      const role = store.roles.get(affectation.id_role);
      return role ? role.permissions.some((permission) => permission.permission === permissionDemandee) : false;
    });
  }
}
