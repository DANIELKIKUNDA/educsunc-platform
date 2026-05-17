import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

// Cette migration cree la table des plans danticipation de frais.
export class Migration_010_CreatePlansAnticipationFrais implements MigrationPostgresPaiementsFacturation {
  public readonly version = 10;
  public readonly nom = 'CreatePlansAnticipationFrais';
  public async executer(client: PoolClient): Promise<void> {
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[9]!);
  }
}
