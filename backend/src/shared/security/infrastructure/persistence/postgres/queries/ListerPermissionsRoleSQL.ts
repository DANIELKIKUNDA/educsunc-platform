import type { ListerPermissionsRoleQuery, PermissionReadModel } from '../../../../application';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';

export class ListerPermissionsRoleSQL implements ListerPermissionsRoleQuery {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}
  public async executer(codeRole: string): Promise<readonly PermissionReadModel[]> {
    const resultat = await this.clientSql.executer<{permission:string}>(
      `SELECT p.permission FROM security_permissions_roles p
       JOIN security_roles r ON r.id_role=p.id_role WHERE r.code_role=$1 ORDER BY p.permission`, [codeRole],
    );
    return resultat.lignes.map(({permission}) => ({permission}));
  }
}
