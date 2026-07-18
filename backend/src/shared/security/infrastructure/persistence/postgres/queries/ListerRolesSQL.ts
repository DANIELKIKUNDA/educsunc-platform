import type { ListerRolesQuery, RoleReadModel } from '../../../../application';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';

export class ListerRolesSQL implements ListerRolesQuery {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}
  public async executer(): Promise<readonly RoleReadModel[]> {
    const resultat = await this.clientSql.executer<{
      id_role: string; code_role: string; nom_role: string; description: string | null;
      niveau_acces: string; est_actif: boolean; est_systeme: boolean;
      nombre_permissions: number; nombre_restrictions: number; nombre_affectations: number;
    }>(`SELECT r.id_role,r.code_role,r.nom_role,r.description,r.niveau_acces,r.est_actif,r.est_systeme,
      COUNT(DISTINCT p.id_permission_role)::int AS nombre_permissions,
      COUNT(DISTINCT x.id_restriction_role)::int AS nombre_restrictions,
      COUNT(DISTINCT a.id_affectation_utilisateur)::int AS nombre_affectations
      FROM security_roles r
      LEFT JOIN security_permissions_roles p ON p.id_role=r.id_role
      LEFT JOIN security_restrictions_roles x ON x.id_role=r.id_role
      LEFT JOIN security_affectations_utilisateurs a ON a.id_role=r.id_role
      GROUP BY r.id_role ORDER BY r.nom_role`);
    return resultat.lignes.map((r) => ({
      idRole:r.id_role,codeRole:r.code_role,nomRole:r.nom_role,
      description:r.description ?? undefined,niveauAcces:r.niveau_acces,
      estActif:r.est_actif,estSysteme:r.est_systeme,
      nombrePermissions:r.nombre_permissions,nombreRestrictions:r.nombre_restrictions,
      nombreAffectations:r.nombre_affectations,
    }));
  }
}
