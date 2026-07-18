import type { PermissionRepositoryPort } from '../../../../application';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';

export class PostgresPermissionRepository implements PermissionRepositoryPort {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async listerPermissionsRole(codeRole: string): Promise<readonly string[]> {
    const resultat = await this.clientSql.executer<{ permission: string }>(
      `SELECT permission.permission
       FROM security_permissions_roles permission
       INNER JOIN security_roles role ON role.id_role = permission.id_role
       WHERE role.code_role = $1 ORDER BY permission.permission`,
      [String(codeRole).trim()],
    );
    return resultat.lignes.map((ligne) => ligne.permission);
  }
}
