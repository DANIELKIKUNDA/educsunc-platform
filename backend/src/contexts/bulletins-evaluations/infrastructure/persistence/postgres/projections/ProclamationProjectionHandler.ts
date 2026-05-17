import type { ProclamationClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationClasseReadModel';
import { ProjectionProclamationService } from '../../../services/ProjectionProclamationService';

// Ce fichier materialise la projection documentaire des proclamations.
export class ProclamationProjectionHandler {
  // Ce constructeur injecte le service specialise des proclamations.
  constructor(private readonly service: ProjectionProclamationService) {}

  // Cette methode projette une proclamation dans la lecture locale.
  public projeter(proclamation: ProclamationClasseReadModel): ProclamationClasseReadModel {
    return this.service.construireProjection(proclamation);
  }
}
