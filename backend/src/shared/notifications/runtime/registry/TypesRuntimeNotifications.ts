import type { ResultatExecutionWorkerNotifications } from '../../workers';

// Ce fichier declare les types publics de la couche runtime Notifications.

/** Cette union represente l'etat courant d'un composant runtime Notifications. */
export type StatutComposantRuntimeNotifications =
  | 'INITIALISE'
  | 'DEMARRAGE'
  | 'ACTIF'
  | 'DEGRADE'
  | 'ARRETE';

/** Cette interface represente l'etat d'un composant runtime enregistre. */
export interface EnregistrementComposantRuntimeNotifications {
  readonly nom: string;
  readonly statut: StatutComposantRuntimeNotifications;
  readonly misAJourLe: Date;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente un snapshot global du runtime Notifications. */
export interface SnapshotRuntimeNotifications {
  readonly composants: readonly EnregistrementComposantRuntimeNotifications[];
  readonly derniersResultatsWorkers: readonly ResultatExecutionWorkerNotifications[];
  readonly collecteLe: Date;
}
