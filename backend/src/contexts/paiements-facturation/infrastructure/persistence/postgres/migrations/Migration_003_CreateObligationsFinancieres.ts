import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

// Cette migration cree les obligations financieres et la vue consolidee des dettes.
export class Migration_003_CreateObligationsFinancieres implements MigrationPostgresPaiementsFacturation {
  public readonly version = 3;
  public readonly nom = 'CreateObligationsFinancieres';
  public async executer(client: PoolClient): Promise<void> {
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[2]!);
  }
}
