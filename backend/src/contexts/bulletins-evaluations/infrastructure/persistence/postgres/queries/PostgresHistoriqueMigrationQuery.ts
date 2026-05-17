import type { HistoriqueMigrationQuery } from 'contexts/bulletins-evaluations/application/queries/HistoriqueMigrationQuery';
import type { MigrationBulletinReadModel } from 'contexts/bulletins-evaluations/application/read-models/MigrationBulletinReadModel';
import { PostgresDepotMigrationBulletin } from '../depots/PostgresDepotMigrationBulletin';
import { MigrationBulletinPostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale de l'historique des migrations de bulletin.
export class PostgresHistoriqueMigrationQuery implements HistoriqueMigrationQuery {
  private readonly depot = new PostgresDepotMigrationBulletin();

  // Cette methode relit toutes les migrations deja enregistrees pour une classe sur une annee.
  public async executer(idClassePedagogique: string, idAnneeScolaire: string): Promise<MigrationBulletinReadModel[]> {
    return (await this.depot.listerParClasseEtAnnee(idClassePedagogique, idAnneeScolaire)).map((migration) => MigrationBulletinPostgresMapper.versReadModel(migration));
  }
}
