import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

// Cette migration cree la table des restitutions dexcedents.
export class Migration_011_CreateRestitutions implements MigrationPostgresPaiementsFacturation {
  public readonly version = 11;
  public readonly nom = 'CreateRestitutions';
  public async executer(client: PoolClient): Promise<void> {
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[10]!);
  }
}
