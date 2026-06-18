import type { PoolClient } from 'pg';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';

export class Migration_014_AddConsultationHistoriqueDelegueeParametresPaiement
  implements MigrationPostgresPaiementsFacturation
{
  public readonly version = 14;
  public readonly nom = 'AddConsultationHistoriqueDelegueeParametresPaiement';

  public async executer(client: PoolClient): Promise<void> {
    await client.query([
      'ALTER TABLE "parametres_paiement_ecole"',
      'ADD COLUMN IF NOT EXISTS "consultation_historique_paiements_deleguee" JSONB',
    ].join(' '));
  }
}
