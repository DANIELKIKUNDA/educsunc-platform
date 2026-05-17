import type { StatistiquesClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/StatistiquesClasseReadModel';
import type { StatistiquesEcoleReadModel } from 'contexts/bulletins-evaluations/application/read-models/StatistiquesEcoleReadModel';
import { obtenirMemoireTechniqueBulletins } from '../persistence/postgres/depots/outilsDepotBulletin';

// Ce fichier materialise localement les statistiques calculees pour eviter des recalculs inutiles.
export class BulletinStatisticsMaterializer {
  // Cette methode stocke les statistiques d'une classe sous une cle technique stable.
  public materialiserClasse(cle: string, statistiques: StatistiquesClasseReadModel): StatistiquesClasseReadModel {
    obtenirMemoireTechniqueBulletins().projectionsStatistiques.set(cle, statistiques);
    return statistiques;
  }

  // Cette methode stocke les statistiques d'ecole sous une cle technique stable.
  public materialiserEcole(cle: string, statistiques: StatistiquesEcoleReadModel): StatistiquesEcoleReadModel {
    obtenirMemoireTechniqueBulletins().projectionsStatistiques.set(cle, statistiques);
    return statistiques;
  }
}
