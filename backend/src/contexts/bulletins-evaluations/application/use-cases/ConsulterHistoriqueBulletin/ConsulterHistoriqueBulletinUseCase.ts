import type { HistoriqueBulletinReadModel } from '../../read-models/HistoriqueBulletinReadModel';
import { QueryException } from '../../exceptions/QueryException';
import type { HistoriqueBulletinQuery } from '../../queries/HistoriqueBulletinQuery';

// Ce use case expose la lecture de l'historique de generation d'un bulletin.
export class ConsulterHistoriqueBulletinUseCase {
  constructor(private readonly query: HistoriqueBulletinQuery) {}

  // Cette methode retourne l'historique demande ou echoue proprement.
  public async executer(idBulletinEleve: string): Promise<HistoriqueBulletinReadModel[]> {
    const historique = await this.query.executer(idBulletinEleve);
    if (historique.length === 0) {
      throw new QueryException('Aucun historique de bulletin n a ete trouve pour cette ressource.');
    }

    return historique;
  }
}
