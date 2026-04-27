import { EvenementSynchronisableScolarite, SynchronisationPort } from '../../application/ports/SynchronisationPort';
import type { ServiceSynchronisation } from '../../../../shared/infrastructure/sync/SyncService';

// Ce fichier implemente le port de synchronisation en important le service shared existant.
export class SynchronisationAdapter implements SynchronisationPort {
  constructor(private readonly syncService?: ServiceSynchronisation) {}

  /** Prepare un evenement synchronisable sans dupliquer le moteur shared. */
  public async preparerEvenementSynchronisable(evenement: EvenementSynchronisableScolarite): Promise<void> {
    if (this.syncService === undefined) {
      return;
    }

    await this.syncService.pousser([evenement], { bc: 'scolarite-eleves' });
  }
}
