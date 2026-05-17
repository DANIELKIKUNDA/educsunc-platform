import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import { obtenirMemoireTechniqueBulletins } from '../persistence/postgres/depots/outilsDepotBulletin';

// Ce fichier centralise la materialisation locale des projections de bulletin.
export class ProjectionBulletinService {
  // Cette methode ecrit la projection dans la memoire locale et la retourne telle quelle.
  public construireProjection(bulletin: BulletinEleveReadModel): BulletinEleveReadModel {
    obtenirMemoireTechniqueBulletins().projectionsBulletins.set(bulletin.idBulletinEleve, bulletin);
    return bulletin;
  }
}
