import { SynchronisationOfflineException } from '../exceptions/SynchronisationOfflineException';
import type { OperationOfflineBulletin, OfflineSyncPort } from '../ports/out/OfflineSyncPort';
import type { SynchronisationOutput } from '../dto/output/SynchronisationOutput';

// Ce service coordonne le stockage et la synchronisation des operations offline.
export class ServiceSynchronisationOffline {
  constructor(private readonly offlineSyncPort?: OfflineSyncPort) {}

  // Cette methode enregistre une operation offline en attente de rejeu.
  public async enregistrer(operation: OperationOfflineBulletin): Promise<void> {
    try {
      await this.offlineSyncPort?.enregistrerOperation(operation);
    } catch {
      throw new SynchronisationOfflineException('L operation offline n a pas pu etre memorisee.');
    }
  }

  // Cette methode marque une operation comme synchronisee et retourne un resume de lecture.
  public async marquerSynchronisee(idOperationOffline: string): Promise<SynchronisationOutput> {
    try {
      await this.offlineSyncPort?.marquerOperationSynchronisee(idOperationOffline);
      return {
        idOperationOffline,
        statut: 'SYNCHRONISEE',
        message: 'L operation offline a ete synchronisee avec succes.',
      };
    } catch {
      throw new SynchronisationOfflineException();
    }
  }
}
