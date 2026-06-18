import type { PoolClient } from 'pg';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';

export class Migration_017_AddExonerationDelegueeParametresPaiement
  implements MigrationPostgresPaiementsFacturation
{
  public readonly version = 17;
  public readonly nom = 'AddExonerationDelegueeParametresPaiement';

  public async executer(client: PoolClient): Promise<void> {
    await client.query([
      'ALTER TABLE "parametres_paiement_ecole"',
      'ADD COLUMN IF NOT EXISTS "exoneration_deleguee" JSONB',
    ].join(' '));
  }
}
