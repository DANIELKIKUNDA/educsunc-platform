import {
  ResultatExecutionWorkerNotifications,
} from '../../workers';
import { RegistreRuntimeNotifications } from '../registry/RegistreRuntimeNotifications';

// Ce fichier declare le coordinateur runtime des workers Notifications.

/** Cette interface represente le contrat minimal d un worker runtime executable. */
export interface ContratWorkerRuntimeNotifications {
  executerCycle(...parametres: readonly unknown[]): Promise<ResultatExecutionWorkerNotifications>;
}

/** Cette classe declenche et memorise les cycles des workers specialises du moteur. */
export class CoordinateurWorkersNotifications {
  /** Ce constructeur assemble les workers stateless exposes par la phase runtime. */
  constructor(
    private readonly registreRuntimeNotifications: RegistreRuntimeNotifications,
    private readonly workerDiffusionNotifications: ContratWorkerRuntimeNotifications,
    private readonly workerRetryNotifications: ContratWorkerRuntimeNotifications,
    private readonly workerReplayNotifications: ContratWorkerRuntimeNotifications,
    private readonly workerEscaladeNotifications: ContratWorkerRuntimeNotifications,
    private readonly workerMonitoringNotifications: ContratWorkerRuntimeNotifications,
    private readonly workerArchivageNotifications: ContratWorkerRuntimeNotifications,
    private readonly workerCleanupNotifications: ContratWorkerRuntimeNotifications,
    private readonly workerRecoveryNotifications: ContratWorkerRuntimeNotifications,
  ) {}

  /** Cette methode execute une passe globale de tous les workers runtime. */
  public async executerCycleGlobal(): Promise<readonly ResultatExecutionWorkerNotifications[]> {
    const resultats = [
      await this.workerDiffusionNotifications.executerCycle(),
      await this.workerRetryNotifications.executerCycle(),
      await this.workerReplayNotifications.executerCycle(),
      await this.workerEscaladeNotifications.executerCycle(),
      await this.workerMonitoringNotifications.executerCycle(),
      await this.workerArchivageNotifications.executerCycle(),
      await this.workerCleanupNotifications.executerCycle(),
      await this.workerRecoveryNotifications.executerCycle(),
    ];

    for (const resultat of resultats) {
      this.registreRuntimeNotifications.enregistrerResultatWorker(resultat);
      this.registreRuntimeNotifications.enregistrerComposant(
        `worker:${resultat.typeWorker.toLowerCase()}`,
        resultat.succes ? 'ACTIF' : 'DEGRADE',
        {
          totalTraites: resultat.totalTraites,
          totalEchecs: resultat.totalEchecs,
        },
      );
    }

    return resultats;
  }
}
