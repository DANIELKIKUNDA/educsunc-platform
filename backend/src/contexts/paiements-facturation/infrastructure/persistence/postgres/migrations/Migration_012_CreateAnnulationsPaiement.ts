import type { PoolClient } from 'pg';
import { schemasTablesPaiementsFacturation } from '../schemas/SchemasTablesPaiementsFacturation';
import type { MigrationPostgresPaiementsFacturation } from './MigrationPostgresPaiementsFacturation';
import { creerTableDepuisSchemaPaiements } from './HelperMigrationPaiementsFacturation';

// Cette migration cree les annulations de paiements et leurs operations inverses.
export class Migration_012_CreateAnnulationsPaiement implements MigrationPostgresPaiementsFacturation {
  public readonly version = 12;
  public readonly nom = 'CreateAnnulationsPaiement';

  // Cette methode cree d'abord la table des annulations puis la table des operations inverses.
  public async executer(client: PoolClient): Promise<void> {
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[11]!);
    await creerTableDepuisSchemaPaiements(client, schemasTablesPaiementsFacturation[12]!);
  }
}
