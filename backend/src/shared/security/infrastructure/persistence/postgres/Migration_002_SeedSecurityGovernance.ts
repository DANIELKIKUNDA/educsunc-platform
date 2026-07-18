import type { PoolClient } from 'pg';
import { CATALOGUE_ROLES_SYSTEME, PERMISSIONS_SECURITE } from '../../../domain';
import type { MigrationPostgresSecurity } from './MigrationPostgresSecurity';

function libellePermission(code: string): string {
  return code
    .split('.')
    .map((segment) => segment.replaceAll('-', ' '))
    .join(' · ')
    .replace(/^./, (lettre) => lettre.toUpperCase());
}

export class Migration_002_SeedSecurityGovernance implements MigrationPostgresSecurity {
  public readonly version = 2;
  public readonly nom = 'seed_security_system_roles_and_permission_catalog';

  public async executer(client: PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_permissions_catalogue (
        code_permission TEXT PRIMARY KEY,
        libelle TEXT NOT NULL,
        domaine TEXT NOT NULL,
        description TEXT NOT NULL,
        niveaux_applicables TEXT[] NOT NULL,
        est_systeme BOOLEAN NOT NULL DEFAULT TRUE,
        est_configurable BOOLEAN NOT NULL DEFAULT TRUE,
        est_active BOOLEAN NOT NULL DEFAULT TRUE,
        cree_le TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        modifie_le TIMESTAMPTZ
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_mutation_history (
        id_mutation TEXT PRIMARY KEY,
        auteur_id TEXT,
        action TEXT NOT NULL,
        cible_id TEXT NOT NULL,
        type_cible TEXT NOT NULL,
        niveau_scope TEXT NOT NULL,
        organisation_id TEXT,
        ecole_id TEXT,
        motif TEXT,
        etat_avant JSONB,
        etat_apres JSONB,
        trace_id TEXT,
        cree_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS security_mutation_cible_idx ON security_mutation_history (type_cible, cible_id, cree_le DESC)');

    for (const permission of PERMISSIONS_SECURITE) {
      await client.query(
        `INSERT INTO security_permissions_catalogue (
           code_permission,libelle,domaine,description,niveaux_applicables,
           est_systeme,est_configurable,est_active
         ) VALUES ($1,$2,$3,$4,$5,TRUE,TRUE,TRUE)
         ON CONFLICT (code_permission) DO NOTHING`,
        [permission, libellePermission(permission), permission.split('.')[0],
          `Autorise l'action ${libellePermission(permission).toLowerCase()}.`,
          ['PLATEFORME', 'ORGANISATION', 'ECOLE']],
      );
    }

    for (const role of CATALOGUE_ROLES_SYSTEME) {
      const idRole = `system-role:${role.code}`;
      await client.query(
        `INSERT INTO security_roles (
           id_role,code_role,nom_role,description,niveau_acces,est_systeme,
           est_actif,cree_le,cree_par,version
         ) VALUES ($1,$2,$3,$4,$5,TRUE,TRUE,NOW(),'bootstrap-security',1)
         ON CONFLICT (code_role) DO UPDATE SET
           nom_role=EXCLUDED.nom_role,
           description=EXCLUDED.description,
           niveau_acces=EXCLUDED.niveau_acces,
           est_systeme=TRUE,
           est_actif=TRUE`,
        [idRole, role.code, role.libelle,
          `Rôle officiel ${role.libelle} administré par EduSync.`, role.niveau],
      );
      const rolePersistant = await client.query<{ id_role: string }>(
        'SELECT id_role FROM security_roles WHERE code_role=$1', [role.code],
      );
      const idRolePersistant = rolePersistant.rows[0]?.id_role;
      if (!idRolePersistant) throw new Error(`Le rôle système ${role.code} n'a pas été créé.`);

      await client.query(
        `DELETE FROM security_permissions_roles
         WHERE id_role=$1 AND NOT (permission = ANY($2::text[]))`,
        [idRolePersistant, [...role.permissions]],
      );
      for (const permission of role.permissions) {
        await client.query(
          `INSERT INTO security_permissions_roles (
             id_permission_role,id_role,permission,cree_le,cree_par
           ) VALUES ($1,$2,$3,NOW(),'bootstrap-security')
           ON CONFLICT (id_role,permission) DO NOTHING`,
          [`system-permission:${role.code}:${permission}`, idRolePersistant, permission],
        );
      }
    }
  }
}
