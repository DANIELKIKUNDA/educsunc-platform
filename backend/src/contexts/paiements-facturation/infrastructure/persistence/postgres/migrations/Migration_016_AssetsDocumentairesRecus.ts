import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

export class Migration_016_AssetsDocumentairesRecus
  implements MigrationPostgresPaiementsFacturation
{
  public readonly version = 16;
  public readonly nom = 'AssetsDocumentairesRecus';

  public async executer(client: PoolClient): Promise<void> {
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[16]!);
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[17]!);
  }
}
