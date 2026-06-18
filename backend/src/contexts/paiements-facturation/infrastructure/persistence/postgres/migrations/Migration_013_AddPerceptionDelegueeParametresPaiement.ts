import type { PoolClient } from 'pg';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';

export class Migration_013_AddPerceptionDelegueeParametresPaiement
  implements MigrationPostgresPaiementsFacturation
{
  public readonly version = 13;
  public readonly nom = 'AddPerceptionDelegueeParametresPaiement';

  public async executer(client: PoolClient): Promise<void> {
    await client.query([
      'ALTER TABLE "parametres_paiement_ecole"',
      'ADD COLUMN IF NOT EXISTS "perception_deleguee_par_type_frais" JSONB',
    ].join(' '));
  }
}
