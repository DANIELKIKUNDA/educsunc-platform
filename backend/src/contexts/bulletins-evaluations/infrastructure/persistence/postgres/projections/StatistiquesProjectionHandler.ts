import type { StatistiquesClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/StatistiquesClasseReadModel';
import type { StatistiquesEcoleReadModel } from 'contexts/bulletins-evaluations/application/read-models/StatistiquesEcoleReadModel';
import { BulletinStatisticsMaterializer } from '../../../services/BulletinStatisticsMaterializer';

// Ce fichier materialise la projection documentaire des statistiques du BC.
export class StatistiquesProjectionHandler {
  // Ce constructeur injecte le materializer local des statistiques.
  constructor(private readonly service: BulletinStatisticsMaterializer) {}

  // Cette methode projette des statistiques de classe.
  public projeterClasse(cle: string, statistiques: StatistiquesClasseReadModel): StatistiquesClasseReadModel {
    return this.service.materialiserClasse(cle, statistiques);
  }

  // Cette methode projette des statistiques d'ecole.
  public projeterEcole(cle: string, statistiques: StatistiquesEcoleReadModel): StatistiquesEcoleReadModel {
    return this.service.materialiserEcole(cle, statistiques);
  }
}
