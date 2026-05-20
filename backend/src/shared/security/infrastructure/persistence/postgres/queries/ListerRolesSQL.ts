import type { ListerRolesQuery, RoleReadModel } from '../../../../application';
import { obtenirMemoireSecurityStore } from '../repositories/_memoireSecurityStore';

// Cette query retourne la liste optimisee des roles SECURITY.
export class ListerRolesSQL implements ListerRolesQuery {
  public async executer(): Promise<readonly RoleReadModel[]> {
    return Array.from(obtenirMemoireSecurityStore().roles.values()).map((record) => ({
      idRole: record.id_role,
      codeRole: record.code_role,
      nomRole: record.nom_role,
      niveauAcces: record.niveau_acces,
      estActif: record.est_actif,
    }));
  }
}
