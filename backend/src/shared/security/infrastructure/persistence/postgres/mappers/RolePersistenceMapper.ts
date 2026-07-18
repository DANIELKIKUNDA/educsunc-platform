import {
  CodeRestrictionMetier,
  CodeRole,
  NiveauAcces,
  PermissionRole,
  PermissionSecurite,
  RestrictionRole,
  Role,
  type ProprietesRole,
} from '../../../../domain';

export interface RoleRecord {
  id_role: string;
  code_role: string;
  nom_role: string;
  description?: string;
  niveau_acces: string;
  est_systeme: boolean;
  est_actif: boolean;
  cree_le: string;
  cree_par?: string;
  modifie_le?: string;
  modifie_par?: string;
  version: number;
  permissions: PermissionRoleRecord[];
  restrictions: RestrictionRoleRecord[];
}

export interface PermissionRoleRecord {
  id_permission_role: string;
  permission: string;
  cree_le: string;
  cree_par?: string;
}

export interface RestrictionRoleRecord {
  id_restriction_role: string;
  code_restriction: string;
  description?: string;
}

// Ce mapper convertit un role domaine vers son stockage PostgreSQL et inversement.
export class RolePersistenceMapper {
  public static versRecord(role: Role): RoleRecord {
    return {
      id_role: role.obtenirId(),
      code_role: role.obtenirCodeRole().obtenirValeur(),
      nom_role: role.obtenirNomRole(),
      description: role.obtenirDescription(),
      niveau_acces: role.obtenirNiveauAcces().obtenirValeur(),
      est_systeme: role.obtenirEstSysteme(),
      est_actif: role.obtenirEstActif(),
      cree_le: role.obtenirCreeLe().toISOString(),
      cree_par: role.obtenirCreePar(),
      modifie_le: role.obtenirModifieLe()?.toISOString(),
      modifie_par: role.obtenirModifiePar(),
      version: role.obtenirVersion(),
      permissions: role.obtenirPermissions().map((permissionRole) => PermissionPersistenceMapper.versRecord(permissionRole)),
      restrictions: role.obtenirRestrictions().map((restrictionRole) => ({
        id_restriction_role: restrictionRole.obtenirId(),
        code_restriction: restrictionRole.obtenirCodeRestriction().obtenirValeur(),
        description: restrictionRole.obtenirDescription(),
      })),
    };
  }

  public static depuisRecord(record: RoleRecord): Role {
    const proprietes: ProprietesRole = {
      idRole: record.id_role,
      codeRole: new CodeRole(record.code_role),
      nomRole: record.nom_role,
      description: record.description,
      niveauAcces: new NiveauAcces(record.niveau_acces),
      estSysteme: record.est_systeme,
      estActif: record.est_actif,
      creeLe: new Date(record.cree_le),
      creePar: record.cree_par,
      modifieLe: record.modifie_le ? new Date(record.modifie_le) : undefined,
      modifiePar: record.modifie_par,
      version: record.version,
      permissions: record.permissions.map((permission) => PermissionPersistenceMapper.depuisRecord(permission)),
      restrictions: record.restrictions.map((restriction) => new RestrictionRole({
        idRestrictionRole: restriction.id_restriction_role,
        codeRestriction: new CodeRestrictionMetier(restriction.code_restriction),
        description: restriction.description,
      })),
    };

    return new Role(proprietes);
  }
}

// Ce mapper gere la conversion des permissions de role pour la persistance.
export class PermissionPersistenceMapper {
  public static versRecord(permissionRole: PermissionRole): PermissionRoleRecord {
    return {
      id_permission_role: permissionRole.obtenirId(),
      permission: permissionRole.obtenirPermission().obtenirValeur(),
      cree_le: permissionRole.obtenirCreeLe().toISOString(),
      cree_par: permissionRole.obtenirCreePar(),
    };
  }

  public static depuisRecord(record: PermissionRoleRecord): PermissionRole {
    return new PermissionRole({
      idPermissionRole: record.id_permission_role,
      permission: new PermissionSecurite(record.permission),
      creeLe: new Date(record.cree_le),
      creePar: record.cree_par,
    });
  }
}
