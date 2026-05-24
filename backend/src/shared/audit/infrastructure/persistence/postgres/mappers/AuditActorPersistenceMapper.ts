import { ActeurAudit, AuditPermissionContext } from '../../../../domain/entities';
import { TYPE_ACTEUR_AUDIT_ENUM } from '../../../../domain/enums';
import type { TypeActeurAudit } from '../../../../domain/entities/ActeurAudit';
import type { AuditEntryRow } from './AuditPersistenceRecords';
import { AuditJsonbMapper } from './AuditJsonbMapper';

export interface AuditActorFragments {
  acteurAudit: ActeurAudit;
  auditPermissionContext?: AuditPermissionContext;
}

// Ce mapper preserve l'acteur historique exact, meme si ses droits changent plus tard.
export class AuditActorPersistenceMapper {
  public static versColonnes(entree: {
    idAuditEntry: string;
    acteurAudit: ActeurAudit;
    auditPermissionContext?: AuditPermissionContext;
  }): Pick<AuditEntryRow, 'acteur_id' | 'type_acteur' | 'role_actif' | 'contexte_permissions'> {
    return {
      acteur_id: entree.acteurAudit.obtenirIdUtilisateur() ?? null,
      type_acteur: entree.acteurAudit.obtenirTypeActeur(),
      role_actif: entree.acteurAudit.obtenirRoleActif() ?? null,
      contexte_permissions: AuditJsonbMapper.serialiser({
        rolesActifs: entree.auditPermissionContext?.obtenirRolesActifs() ?? [],
        permissionsActives: entree.auditPermissionContext?.obtenirPermissionsActives() ?? [],
        scopesActifs: entree.auditPermissionContext?.obtenirScopesActifs() ?? [],
        nomUtilisateur: entree.acteurAudit.obtenirNomUtilisateur(),
        emailUtilisateur: entree.acteurAudit.obtenirEmailUtilisateur(),
        sourceActeur: entree.acteurAudit.obtenirSourceActeur(),
      }),
    };
  }

  public static depuisColonnes(row: Pick<AuditEntryRow, 'id_audit_entry' | 'acteur_id' | 'type_acteur' | 'role_actif' | 'contexte_permissions'>): AuditActorFragments {
    const permissions = AuditJsonbMapper.deserialiserObjet(row.contexte_permissions) ?? {};
    const typeActeur: TypeActeurAudit = TYPE_ACTEUR_AUDIT_ENUM.includes(row.type_acteur as (typeof TYPE_ACTEUR_AUDIT_ENUM)[number])
      ? (row.type_acteur as TypeActeurAudit)
      : 'SYSTEME';
    const acteurAudit = new ActeurAudit({
      idActeurAudit: `${row.id_audit_entry}-actor`,
      typeActeur,
      idUtilisateur: row.acteur_id ?? undefined,
      nomUtilisateur: typeof permissions.nomUtilisateur === 'string' ? permissions.nomUtilisateur : undefined,
      emailUtilisateur: typeof permissions.emailUtilisateur === 'string' ? permissions.emailUtilisateur : undefined,
      roleActif: row.role_actif ?? undefined,
      sourceActeur: typeof permissions.sourceActeur === 'string' ? permissions.sourceActeur : typeActeur,
    });

    const rolesActifs = Array.isArray(permissions.rolesActifs) ? permissions.rolesActifs.filter((v): v is string => typeof v === 'string') : [];
    const permissionsActives = Array.isArray(permissions.permissionsActives) ? permissions.permissionsActives.filter((v): v is string => typeof v === 'string') : [];
    const scopesActifs = Array.isArray(permissions.scopesActifs) ? permissions.scopesActifs.filter((v): v is string => typeof v === 'string') : [];

    return {
      acteurAudit,
      auditPermissionContext: rolesActifs.length > 0 || permissionsActives.length > 0 || scopesActifs.length > 0
        ? new AuditPermissionContext({
          idAuditPermissionContext: `${row.id_audit_entry}-permissions`,
          rolesActifs,
          permissionsActives,
          scopesActifs,
        })
        : undefined,
    };
  }
}
