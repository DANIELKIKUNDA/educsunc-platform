import { randomUUID } from 'node:crypto';
import { PortMonitoringNotification } from '../../application';
import { FileRetryNotifications, JobFileNotification } from '../queues';
import { RegulateurRetryNotification } from './RegulateurRetryNotification';
import { EntreeRetryNotification, ResultatExecutionRetryNotification } from './TypesRetryNotification';

// Ce fichier execute les retries techniques du moteur Notifications.

/** Cette classe consomme la file de retry et conserve un historique technique memoire. */
export class ExecutantRetryNotification {
  private readonly historiquesParNotification = new Map<string, EntreeRetryNotification[]>();

  /** Ce constructeur assemble les dependances techniques du retry. */
  constructor(
    private readonly fileRetryNotifications: FileRetryNotifications,
    private readonly regulateurRetryNotification: RegulateurRetryNotification,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode execute un cycle de retry technique sur un lot disponible. */
  public async executerCycle(): Promise<ResultatExecutionRetryNotification[]> {
    const jobs = this.regulateurRetryNotification.preleverLot();
    const resultats: ResultatExecutionRetryNotification[] = [];

    for (const job of jobs) {
      resultats.push(await this.executerJob(job));
    }

    return resultats;
  }

  /** Cette methode expose la file de retry sous-jacente pour les integrations futures. */
  public obtenirFileRetry(): FileRetryNotifications {
    return this.fileRetryNotifications;
  }

  /** Cette methode retourne l'historique technique de retry d'une notification. */
  public lireHistorique(identifiantNotification: string): EntreeRetryNotification[] {
    return [...(this.historiquesParNotification.get(identifiantNotification) ?? [])];
  }

  /** Cette methode execute un job unique de retry technique. */
  private async executerJob(job: JobFileNotification): Promise<ResultatExecutionRetryNotification> {
    const entree = this.ouvrirEntree(job);

    try {
      const miseAJour = this.terminerEntree(job.identifiantNotification, entree.identifiantRetry, true);
      await this.portMonitoringNotification.enregistrerSignal('notifications.retry.executed', {
        notificationId: job.identifiantNotification,
        retryId: entree.identifiantRetry,
        tentative: miseAJour?.tentative,
      });

      return {
        identifiantNotification: job.identifiantNotification,
        identifiantRetry: entree.identifiantRetry,
        succes: true,
        message: 'Retry technique execute.',
        horodatage: new Date(),
      };
    } catch (erreur) {
      const message = erreur instanceof Error ? erreur.message : 'Echec technique de retry.';
      this.terminerEntree(job.identifiantNotification, entree.identifiantRetry, false, message);
      await this.portMonitoringNotification.enregistrerSignal('notifications.retry.failed', {
        notificationId: job.identifiantNotification,
        retryId: entree.identifiantRetry,
        erreur: message,
      });

      return {
        identifiantNotification: job.identifiantNotification,
        identifiantRetry: entree.identifiantRetry,
        succes: false,
        message,
        horodatage: new Date(),
      };
    }
  }

  /** Cette methode ouvre une nouvelle entree d'historique de retry. */
  private ouvrirEntree(job: JobFileNotification): EntreeRetryNotification {
    const entree: EntreeRetryNotification = {
      identifiantRetry: randomUUID(),
      identifiantNotification: job.identifiantNotification,
      correlationId: job.correlationId,
      requestId: job.requestId,
      raison: job.metadata.raison as string | undefined,
      action: job.metadata.action as string | undefined,
      tentative: job.tentative,
      maximumRetry: job.metadata.maximumRetry as number | undefined,
      planifieLe: job.creeLe,
      succes: false,
      metadata: { ...job.metadata },
    };

    const historique = this.historiquesParNotification.get(job.identifiantNotification) ?? [];
    historique.push(entree);
    this.historiquesParNotification.set(job.identifiantNotification, historique);
    return entree;
  }

  /** Cette methode cloture une entree d'historique de retry. */
  private terminerEntree(
    identifiantNotification: string,
    identifiantRetry: string,
    succes: boolean,
    erreur?: string,
  ): EntreeRetryNotification | null {
    const historique = this.historiquesParNotification.get(identifiantNotification) ?? [];
    const index = historique.findIndex((element) => element.identifiantRetry === identifiantRetry);
    if (index < 0) {
      return null;
    }

    const precedente = historique[index];
    const miseAJour: EntreeRetryNotification = {
      ...precedente,
      succes,
      erreur,
      executeLe: new Date(),
    };
    historique[index] = miseAJour;
    this.historiquesParNotification.set(identifiantNotification, historique);
    return miseAJour;
  }
}
