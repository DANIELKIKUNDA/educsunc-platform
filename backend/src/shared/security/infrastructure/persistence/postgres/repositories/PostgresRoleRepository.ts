import type { RoleRepositoryPort } from '../../../../application';
import type { Role } from '../../../../domain';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import { RolePersistenceMapper, type PermissionRoleRecord, type RestrictionRoleRecord, type RoleRecord } from '../mappers';

type ClientTransactionnel = SqlQueryClient & { dansTransaction?<T>(operation: () => Promise<T>): Promise<T> };
type RoleRow = Omit<RoleRecord, 'permissions' | 'restrictions'>;

export class PostgresRoleRepository implements RoleRepositoryPort {
  constructor(private readonly clientSql: ClientTransactionnel = obtenirClientPostgresAuth()) {}

  public async sauvegarder(role: Role): Promise<void> {
    await this.dansTransaction(async () => {
      const record = RolePersistenceMapper.versRecord(role);
      const resultat = await this.clientSql.executer(
        `INSERT INTO security_roles (
           id_role, code_role, nom_role, description, niveau_acces, est_systeme,
           est_actif, cree_le, cree_par, modifie_le, modifie_par, version
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id_role) DO UPDATE SET
           nom_role = EXCLUDED.nom_role, description = EXCLUDED.description,
           niveau_acces = EXCLUDED.niveau_acces, est_systeme = EXCLUDED.est_systeme,
           est_actif = EXCLUDED.est_actif, modifie_le = EXCLUDED.modifie_le,
           modifie_par = EXCLUDED.modifie_par, version = EXCLUDED.version
         WHERE security_roles.version < EXCLUDED.version`,
        [record.id_role, record.code_role, record.nom_role, record.description ?? null,
          record.niveau_acces, record.est_systeme, record.est_actif, record.cree_le,
          record.cree_par ?? null, record.modifie_le ?? null, record.modifie_par ?? null, record.version],
      );
      if (resultat.nombreLignesAffectees === 0) {
        throw new Error('Conflit de version lors de la sauvegarde du role.');
      }
      await this.clientSql.executer('DELETE FROM security_permissions_roles WHERE id_role = $1', [record.id_role]);
      for (const permission of record.permissions) {
        await this.clientSql.executer(
          `INSERT INTO security_permissions_roles
             (id_permission_role, id_role, permission, cree_le, cree_par)
           VALUES ($1,$2,$3,$4,$5)`,
          [permission.id_permission_role, record.id_role, permission.permission,
            permission.cree_le, permission.cree_par ?? null],
        );
      }
      await this.clientSql.executer('DELETE FROM security_restrictions_roles WHERE id_role = $1', [record.id_role]);
      for (const restriction of record.restrictions) {
        await this.clientSql.executer(
          `INSERT INTO security_restrictions_roles
             (id_restriction_role, id_role, code_restriction, description)
           VALUES ($1,$2,$3,$4)`,
          [restriction.id_restriction_role, record.id_role, restriction.code_restriction,
            restriction.description ?? null],
        );
      }
    });
  }

  public async trouverParCode(codeRole: string): Promise<Role | null> {
    const resultat = await this.clientSql.executer<RoleRow>(
      'SELECT * FROM security_roles WHERE code_role = $1', [String(codeRole).trim()],
    );
    return resultat.lignes[0] ? this.hydrater(resultat.lignes[0]) : null;
  }

  public async trouverParId(idRole: string): Promise<Role | null> {
    const resultat = await this.clientSql.executer<RoleRow>(
      'SELECT * FROM security_roles WHERE id_role = $1', [idRole],
    );
    return resultat.lignes[0] ? this.hydrater(resultat.lignes[0]) : null;
  }

  public async listerTous(): Promise<readonly Role[]> {
    const resultat = await this.clientSql.executer<RoleRow>('SELECT * FROM security_roles ORDER BY code_role');
    return Promise.all(resultat.lignes.map((ligne) => this.hydrater(ligne)));
  }

  private async hydrater(ligne: RoleRow): Promise<Role> {
    const permissions = await this.clientSql.executer<PermissionRoleRecord>(
      `SELECT id_permission_role, permission, cree_le, cree_par
       FROM security_permissions_roles WHERE id_role = $1 ORDER BY permission`, [ligne.id_role],
    );
    const restrictions = await this.clientSql.executer<RestrictionRoleRecord>(
      `SELECT id_restriction_role, code_restriction, description
       FROM security_restrictions_roles WHERE id_role = $1 ORDER BY code_restriction`, [ligne.id_role],
    );
    return RolePersistenceMapper.depuisRecord({
      ...ligne,
      permissions: [...permissions.lignes],
      restrictions: [...restrictions.lignes],
    });
  }

  private async dansTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return this.clientSql.dansTransaction ? this.clientSql.dansTransaction(operation) : operation();
  }
}
