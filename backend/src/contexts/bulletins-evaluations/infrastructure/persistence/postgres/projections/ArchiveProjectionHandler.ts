import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import { BulletinArchiveService } from '../../../services/BulletinArchiveService';

// Ce fichier cree la projection documentaire des archives de bulletin.
export class ArchiveProjectionHandler {
  // Ce constructeur injecte le service d'archivage local du BC.
  constructor(private readonly service: BulletinArchiveService) {}

  // Cette methode archive un bulletin deja materialise.
  public async projeter(bulletin: BulletinEleveReadModel) {
    return await this.service.archiverBulletin(bulletin);
  }
}
