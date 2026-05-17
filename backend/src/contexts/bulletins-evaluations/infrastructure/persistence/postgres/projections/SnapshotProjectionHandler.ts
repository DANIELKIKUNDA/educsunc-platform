import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import { BulletinSnapshotService } from '../../../services/BulletinSnapshotService';

// Ce fichier cree la projection documentaire des snapshots de bulletin.
export class SnapshotProjectionHandler {
  // Ce constructeur injecte le service de snapshot local.
  constructor(private readonly service: BulletinSnapshotService) {}

  // Cette methode capture un snapshot d'un bulletin materialise.
  public projeter(idSnapshot: string, bulletin: BulletinEleveReadModel) {
    return this.service.enregistrerSnapshot(idSnapshot, bulletin);
  }
}
