import { CoordinateurWorkersNotifications } from './CoordinateurWorkersNotifications';
import { RegistreRuntimeNotifications } from '../registry/RegistreRuntimeNotifications';
import { RuntimeMonitoringNotifications } from '../monitoring/RuntimeMonitoringNotifications';
import { RuntimeRecoveryNotifications } from '../recovery/RuntimeRecoveryNotifications';

// Ce fichier declare le coordinateur principal du runtime Notifications.

/** Cette classe centralise les passes globales et le cycle de vie du runtime Notifications. */
export class CoordinateurRuntimeNotifications {
  /** Ce constructeur assemble les briques runtime majeures du moteur Notifications. */
  constructor(
    private readonly registreRuntimeNotifications: RegistreRuntimeNotifications,
    private readonly coordinateurWorkersNotifications: CoordinateurWorkersNotifications,
    private readonly runtimeMonitoringNotifications: RuntimeMonitoringNotifications,
    private readonly runtimeRecoveryNotifications: RuntimeRecoveryNotifications,
  ) {}

  /** Cette methode marque le runtime comme demarre. */
  public demarrer(): void {
    this.registreRuntimeNotifications.enregistrerComposant('runtime', 'ACTIF');
  }

  /** Cette methode execute une passe globale de runtime. */
  public async executerCycleGlobal(): Promise<{
    readonly monitoring: Awaited<ReturnType<RuntimeMonitoringNotifications['observer']>>;
    readonly workers: Awaited<ReturnType<CoordinateurWorkersNotifications['executerCycleGlobal']>>;
    readonly recovery: Awaited<ReturnType<RuntimeRecoveryNotifications['executerPasse']>>;
  }> {
    const monitoring = await this.runtimeMonitoringNotifications.observer();
    const workers = await this.coordinateurWorkersNotifications.executerCycleGlobal();
    const recovery = await this.runtimeRecoveryNotifications.executerPasse();

    this.registreRuntimeNotifications.enregistrerComposant('runtime', 'ACTIF', {
      totalSignaux: monitoring.signauxRecents.length,
      totalWorkers: workers.length,
      totalOperationsRecovery: recovery.length,
    });

    return {
      monitoring,
      workers,
      recovery,
    };
  }

  /** Cette methode marque le runtime comme arrete. */
  public arreter(): void {
    this.registreRuntimeNotifications.enregistrerComposant('runtime', 'ARRETE');
  }
}
