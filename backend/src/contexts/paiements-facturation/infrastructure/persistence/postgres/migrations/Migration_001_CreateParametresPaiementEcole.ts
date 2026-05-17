import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

// Cette migration cree la table des parametres de paiement par ecole.
export class Migration_001_CreateParametresPaiementEcole implements MigrationPostgresPaiementsFacturation {
  public readonly version = 1;
  public readonly nom = 'CreateParametresPaiementEcole';
  public async executer(client: PoolClient): Promise<void> {
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[0]!);
  }
}
