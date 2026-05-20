import type { Role } from '../../../security/domain';
import type { RoleOutput } from '../dto/output';
export class RoleMapper {
  public static depuisDomaine(role: Role): RoleOutput {
    return {
      idRole: role.obtenirId(),
      codeRole: role.obtenirCodeRole().obtenirValeur(),
      nomRole: role.obtenirNomRole(),
      description: role.obtenirDescription(),
      niveauAcces: role.obtenirNiveauAcces().obtenirValeur(),
      estActif: role.obtenirEstActif(),
    };
  }
}
