// Ce fichier definit le port applicatif de synchronisation offline-first.
export interface EvenementSynchronisableScolarite {
  typeEvenement: string;
  referenceMetier: string;
  payload: Record<string, unknown>;
}

/**
 * Ce port prepare les evenements synchronisables sans mettre la sync dans le domaine.
 */
export interface SynchronisationPort {
  preparerEvenementSynchronisable(evenement: EvenementSynchronisableScolarite): Promise<void>;
}
