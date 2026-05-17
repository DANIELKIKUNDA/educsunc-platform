import type { HistoriqueBulletinQuery } from 'contexts/bulletins-evaluations/application/queries/HistoriqueBulletinQuery';
import type { HistoriqueBulletinReadModel } from 'contexts/bulletins-evaluations/application/read-models/HistoriqueBulletinReadModel';
import { PostgresDepotBulletinEleve } from '../depots/PostgresDepotBulletinEleve';
import { BulletinPostgresMapper } from '../mappers';

// Ce fichier fournit la lecture locale de l'historique de generation d'un bulletin.
export class PostgresHistoriqueBulletinQuery implements HistoriqueBulletinQuery {
  private readonly depot = new PostgresDepotBulletinEleve();

  // Cette methode relit toutes les generations historisees pour un bulletin donne.
  public async executer(idBulletinEleve: string): Promise<HistoriqueBulletinReadModel[]> {
    return (await this.depot.listerHistoriqueGenerations(idBulletinEleve)).map((historique) => BulletinPostgresMapper.versHistorique(historique));
  }
}
