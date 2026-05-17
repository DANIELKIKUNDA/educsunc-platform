import type { SyntheseEcoleOutput } from 'contexts/bulletins-evaluations/application/dto/output/SyntheseEcoleOutput';
import { ProjectionSyntheseService } from '../../../services/ProjectionSyntheseService';

// Ce fichier materialise la projection documentaire des syntheses d'ecole.
export class SyntheseProjectionHandler {
  // Ce constructeur injecte le service specialise des syntheses.
  constructor(private readonly service: ProjectionSyntheseService) {}

  // Cette methode projette une synthese dans la couche lecture locale.
  public projeter(synthese: SyntheseEcoleOutput): SyntheseEcoleOutput {
    return this.service.construireProjection(synthese);
  }
}
