import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import { ProjectionBulletinService } from '../../../services/ProjectionBulletinService';

// Ce fichier materialise la projection documentaire des bulletins.
export class BulletinProjectionHandler {
  // Ce constructeur injecte le service specialise de projection de bulletin.
  constructor(private readonly service: ProjectionBulletinService) {}

  // Cette methode projette un bulletin dans la couche lecture locale.
  public projeter(bulletin: BulletinEleveReadModel): BulletinEleveReadModel {
    return this.service.construireProjection(bulletin);
  }
}
