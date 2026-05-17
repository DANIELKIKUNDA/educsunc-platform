import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

// Cette migration cree les recus et le compteur de numerotation.
export class Migration_006_CreateRecusPaiement implements MigrationPostgresPaiementsFacturation {
  public readonly version = 6;
  public readonly nom = 'CreateRecusPaiement';
  public async executer(client: PoolClient): Promise<void> {
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[5]!);
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[13]!);
  }
}
