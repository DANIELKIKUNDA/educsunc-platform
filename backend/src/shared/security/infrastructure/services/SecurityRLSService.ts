import type { SqlQueryClient } from 'shared/infrastructure/persistence/SqlQueryClient';
import { SecurityTenantPolicyProvider } from '../tenancy/SecurityTenantPolicyProvider';

// Ce service prepare et applique les regles RLS PostgreSQL propres a SECURITY.
export class SecurityRLSService {
  constructor(
    private readonly clientSql: SqlQueryClient,
    private readonly tenantPolicyProvider: SecurityTenantPolicyProvider = new SecurityTenantPolicyProvider(),
  ) {}

  public async appliquerContexte(params: { idOrganisation?: string; idEcole?: string }): Promise<void> {
    const requetes = this.tenantPolicyProvider.produireVariablesSession(params);
    for (const requete of requetes) {
      await this.clientSql.executer(requete.sql, requete.parametres);
    }
  }

  public obtenirPoliciesSQL(): readonly string[] {
    return this.tenantPolicyProvider.produirePoliciesSql();
  }
}
