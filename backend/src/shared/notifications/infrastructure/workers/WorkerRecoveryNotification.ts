// Ce fichier declare le worker de recovery technique du moteur Notifications.

import { PortMonitoringNotification } from '../../application';
import {
  RecuperationDeadLetterNotifications,
  RecuperationProvidersNotifications,
  RecuperationQueuesNotifications,
  RecuperationStockageNotifications,
} from '../recovery';
import { ResultatExecutionWorkerNotification } from './TypesWorkersNotifications';

/** Cette classe coordonne une passe de recovery technique globale du moteur Notifications. */
export class WorkerRecoveryNotification {
  /** Ce constructeur assemble les recuperateurs techniques reutilisables. */
  constructor(
    private readonly recuperationQueuesNotifications: RecuperationQueuesNotifications,
    private readonly recuperationStockageNotifications: RecuperationStockageNotifications,
    private readonly recuperationProvidersNotifications: RecuperationProvidersNotifications,
    private readonly recuperationDeadLetterNotifications: RecuperationDeadLetterNotifications,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode execute une passe globale de recovery technique. */
  public async executerCycle(): Promise<ResultatExecutionWorkerNotification> {
    const details = [
      this.recuperationQueuesNotifications.nettoyerJobsInvalides(),
      this.recuperationStockageNotifications.verifierCoherence(),
      await this.recuperationProvidersNotifications.verifierSante(),
      await this.recuperationDeadLetterNotifications.rejouerDepuisDeadLetter(),
    ];
    const totalSucces = details.filter((detail) => detail.succes).length;

    await this.portMonitoringNotification.enregistrerSignal('notifications.recovery.executed', {
      totalOperations: details.length,
      totalSucces,
    });

    return {
      typeWorker: 'RECOVERY',
      succes: details.every((detail) => detail.succes),
      totalTraites: details.reduce((total, detail) => total + detail.elementsTraites, 0),
      totalSucces,
      totalEchecs: details.length - totalSucces,
      executeLe: new Date(),
      details: details.map((detail) => ({
        identifiantNotification: detail.cible,
        succes: detail.succes,
        message: detail.raison ?? `Recuperation ${detail.cible.toLowerCase()} executee.`,
        metadata: detail.metadata,
      })),
      metadata: {},
    };
  }
}
