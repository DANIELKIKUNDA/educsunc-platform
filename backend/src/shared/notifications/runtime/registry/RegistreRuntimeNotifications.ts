import type { ResultatExecutionWorkerNotifications } from '../../workers';
import {
  EnregistrementComposantRuntimeNotifications,
  SnapshotRuntimeNotifications,
  StatutComposantRuntimeNotifications,
} from './TypesRuntimeNotifications';

// Ce fichier declare le registre central du runtime Notifications.

/** Cette classe memorise l'etat courant des composants et des executions runtime. */
export class RegistreRuntimeNotifications {
  private readonly composants = new Map<string, EnregistrementComposantRuntimeNotifications>();
  private readonly resultatsWorkers: ResultatExecutionWorkerNotifications[] = [];

  /** Ce constructeur fixe la retention memoire des resultats workers. */
  constructor(private readonly retentionWorkers = 100) {}

  /** Cette methode enregistre ou met a jour l'etat d'un composant runtime. */
  public enregistrerComposant(
    nom: string,
    statut: StatutComposantRuntimeNotifications,
    metadata: Readonly<Record<string, unknown>> = {},
  ): void {
    this.composants.set(nom, {
      nom,
      statut,
      misAJourLe: new Date(),
      metadata: { ...metadata },
    });
  }

  /** Cette methode memorise le resultat d'un cycle worker. */
  public enregistrerResultatWorker(resultat: ResultatExecutionWorkerNotifications): void {
    this.resultatsWorkers.push(resultat);
    if (this.resultatsWorkers.length > this.retentionWorkers) {
      this.resultatsWorkers.splice(0, this.resultatsWorkers.length - this.retentionWorkers);
    }
  }

  /** Cette methode retourne un snapshot global de l'etat runtime courant. */
  public observer(): SnapshotRuntimeNotifications {
    return {
      composants: [...this.composants.values()],
      derniersResultatsWorkers: [...this.resultatsWorkers],
      collecteLe: new Date(),
    };
  }
}
