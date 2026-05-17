import type { SyntheseEcoleOutput } from 'contexts/bulletins-evaluations/application/dto/output/SyntheseEcoleOutput';
import { obtenirMemoireTechniqueBulletins } from '../persistence/postgres/depots/outilsDepotBulletin';

// Ce fichier centralise la materialisation locale des projections de synthese d'ecole.
export class ProjectionSyntheseService {
  // Cette methode ecrit la synthese dans la memoire de lecture et la retourne telle quelle.
  public construireProjection(synthese: SyntheseEcoleOutput): SyntheseEcoleOutput {
    obtenirMemoireTechniqueBulletins().projectionsSyntheses.set(synthese.idSyntheseResultatsEcole, synthese);
    return synthese;
  }
}
