import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

// Cette migration cree la table des repartitions de paiement.
export class Migration_005_CreateRepartitionsPaiement implements MigrationPostgresPaiementsFacturation {
  public readonly version = 5;
  public readonly nom = 'CreateRepartitionsPaiement';
  public async executer(client: PoolClient): Promise<void> {
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[4]!);
  }
}
