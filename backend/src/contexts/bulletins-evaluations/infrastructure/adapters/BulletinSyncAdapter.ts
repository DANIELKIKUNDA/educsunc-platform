import type {
  OfflineSyncPort,
  OperationOfflineBulletin,
} from 'contexts/bulletins-evaluations/application/ports/out/OfflineSyncPort';
import type { ServiceSynchronisation } from 'shared/infrastructure/sync/SyncService';

// Ce fichier adapte le mecanisme transverse de synchronisation aux operations offline du BC.
export class BulletinSyncAdapter implements OfflineSyncPort {
  private readonly operationsEnAttente = new Map<string, OperationOfflineBulletin>();

  // Ce constructeur injecte le service shared sans imposer une API distante au BC.
  constructor(private readonly synchronisation: ServiceSynchronisation) {}

  // Cette methode enregistre une operation offline et la pousse dans le journal transverse.
  public async enregistrerOperation(operation: OperationOfflineBulletin): Promise<void> {
    this.operationsEnAttente.set(operation.idOperationOffline, operation);
    await this.synchronisation.pousser([operation], {
      contexte: 'bulletins-evaluations',
      typeOperation: operation.typeOperation,
    });
  }

  // Cette methode marque une operation comme synchronisee et la retire du lot local.
  public async marquerOperationSynchronisee(idOperationOffline: string): Promise<void> {
    this.operationsEnAttente.delete(idOperationOffline);
  }
}
