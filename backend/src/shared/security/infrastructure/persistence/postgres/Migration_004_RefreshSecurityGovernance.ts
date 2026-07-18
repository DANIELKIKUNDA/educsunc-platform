import type { PoolClient } from 'pg';
import type { MigrationPostgresSecurity } from './MigrationPostgresSecurity';
import { Migration_002_SeedSecurityGovernance } from './Migration_002_SeedSecurityGovernance';

export class Migration_004_RefreshSecurityGovernance implements MigrationPostgresSecurity {
  public readonly version = 4;
  public readonly nom = 'refresh_security_governance_catalog';

  public async executer(client: PoolClient): Promise<void> {
    await new Migration_002_SeedSecurityGovernance().executer(client);
  }
}
