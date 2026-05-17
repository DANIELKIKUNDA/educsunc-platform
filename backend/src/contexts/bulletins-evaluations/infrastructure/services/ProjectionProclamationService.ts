import type { ProclamationClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationClasseReadModel';
import { obtenirMemoireTechniqueBulletins } from '../persistence/postgres/depots/outilsDepotBulletin';

// Ce fichier centralise la materialisation locale des projections de proclamation.
export class ProjectionProclamationService {
  // Cette methode ecrit la proclamation materialisee pour qu'elle soit relue rapidement.
  public construireProjection(proclamation: ProclamationClasseReadModel): ProclamationClasseReadModel {
    obtenirMemoireTechniqueBulletins().projectionsProclamations.set(proclamation.idProclamationClasse, proclamation);
    return proclamation;
  }
}
