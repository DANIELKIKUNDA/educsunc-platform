import { Entite } from '../../../domain/Entity';

export interface ProprietesAuditPermissionContext {
  idAuditPermissionContext: string;
  rolesActifs: string[];
  permissionsActives: string[];
  scopesActifs: string[];
}

// Cette entité conserve la réalité historique des droits au moment de l'action.
export class AuditPermissionContext extends Entite<string> {
  private readonly rolesActifs: string[];
  private readonly permissionsActives: string[];
  private readonly scopesActifs: string[];

  constructor(proprietes: ProprietesAuditPermissionContext) {
    super(AuditPermissionContext.validerTexte(proprietes.idAuditPermissionContext, 'idAuditPermissionContext'));
    this.rolesActifs = proprietes.rolesActifs.map((role) => AuditPermissionContext.validerTexte(role, 'rolesActifs'));
    this.permissionsActives = proprietes.permissionsActives.map((permission) => AuditPermissionContext.validerTexte(permission, 'permissionsActives'));
    this.scopesActifs = proprietes.scopesActifs.map((scope) => AuditPermissionContext.validerTexte(scope, 'scopesActifs'));
  }

  public obtenirRolesActifs(): string[] { return [...this.rolesActifs]; }
  public obtenirPermissionsActives(): string[] { return [...this.permissionsActives]; }
  public obtenirScopesActifs(): string[] { return [...this.scopesActifs]; }

  private static validerTexte(valeur: string, champ: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${champ} est obligatoire.`);
    }
    return valeur.trim();
  }
}
