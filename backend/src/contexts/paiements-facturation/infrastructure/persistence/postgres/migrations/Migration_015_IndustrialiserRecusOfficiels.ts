import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

export class Migration_015_IndustrialiserRecusOfficiels
  implements MigrationPostgresPaiementsFacturation
{
  public readonly version = 15;
  public readonly nom = 'IndustrialiserRecusOfficiels';

  public async executer(client: PoolClient): Promise<void> {
    await client.query('DROP INDEX IF EXISTS "ux_recus_paiement_numero_recu"');
    await client.query(
      'CREATE INDEX IF NOT EXISTS "ix_recus_paiement_numero_recu" ON "recus_paiement" ("numero_recu")',
    );
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[14]!);
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[15]!);
  }
}
