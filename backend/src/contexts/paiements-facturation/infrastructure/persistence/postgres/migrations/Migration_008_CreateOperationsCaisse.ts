import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

// Cette migration cree les operations de caisse rattachees a la caisse du jour.
export class Migration_008_CreateOperationsCaisse implements MigrationPostgresPaiementsFacturation {
  public readonly version = 8;
  public readonly nom = 'CreateOperationsCaisse';
  public async executer(client: PoolClient): Promise<void> {
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[7]!);
  }
}
