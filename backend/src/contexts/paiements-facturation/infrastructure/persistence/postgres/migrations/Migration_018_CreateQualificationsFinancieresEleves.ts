import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

// Cette migration cree la table des qualifications financieres autonomes des eleves.
export class Migration_018_CreateQualificationsFinancieresEleves
  implements MigrationPostgresPaiementsFacturation
{
  public readonly version = 18;
  public readonly nom = 'CreateQualificationsFinancieresEleves';

  public async executer(client: PoolClient): Promise<void> {
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[17]!);
  }
}
