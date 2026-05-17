import type { ClassementClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ClassementClasseReadModel';
import { ProjectionClassementService } from '../../../services/ProjectionClassementService';

// Ce fichier materialise la projection documentaire des classements.
export class ClassementProjectionHandler {
  // Ce constructeur injecte le service specialise des classements.
  constructor(private readonly service: ProjectionClassementService) {}

  // Cette methode projette un classement dans la lecture locale.
  public projeter(classement: ClassementClasseReadModel): ClassementClasseReadModel {
    return this.service.construireProjection(classement);
  }
}
