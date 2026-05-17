import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

// Cette migration cree la table des grilles tarifaires.
export class Migration_002_CreateGrillesTarification implements MigrationPostgresPaiementsFacturation {
  public readonly version = 2;
  public readonly nom = 'CreateGrillesTarification';
  public async executer(client: PoolClient): Promise<void> {
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[1]!);
  }
}
