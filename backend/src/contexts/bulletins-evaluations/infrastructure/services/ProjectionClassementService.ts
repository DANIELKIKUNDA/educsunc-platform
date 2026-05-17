import type { ClassementClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ClassementClasseReadModel';
import { obtenirMemoireTechniqueBulletins } from '../persistence/postgres/depots/outilsDepotBulletin';

// Ce fichier centralise la materialisation locale des projections de classement.
export class ProjectionClassementService {
  // Cette methode ecrit la projection de classement dans la memoire technique du BC.
  public construireProjection(classement: ClassementClasseReadModel): ClassementClasseReadModel {
    obtenirMemoireTechniqueBulletins().projectionsClassements.set(classement.idClassementColonneClasse, classement);
    return classement;
  }
}
