import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

// Cette migration cree la table principale des paiements.
export class Migration_004_CreatePaiements implements MigrationPostgresPaiementsFacturation {
  public readonly version = 4;
  public readonly nom = 'CreatePaiements';
  public async executer(client: PoolClient): Promise<void> {
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[3]!);
  }
}
