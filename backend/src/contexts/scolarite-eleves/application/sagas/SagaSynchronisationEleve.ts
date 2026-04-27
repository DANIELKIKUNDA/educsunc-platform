import { EvenementSynchronisableScolarite, SynchronisationPort } from '../ports/SynchronisationPort';

// Ce fichier contient la saga de synchronisation eleve.
/**
 * Cette saga prepare les evenements synchronisables pour le mode offline-first.
 */
export class SagaSynchronisationEleve {
  constructor(private readonly synchronisationPort?: SynchronisationPort) {}

  /** Prepare un evenement pour la synchronisation bidirectionnelle. */
  public async preparerEvenement(evenement: EvenementSynchronisableScolarite): Promise<void> {
    await this.synchronisationPort?.preparerEvenementSynchronisable(evenement);
  }
}
