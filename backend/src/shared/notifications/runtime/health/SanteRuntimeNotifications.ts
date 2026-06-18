import { RegistreRuntimeNotifications } from '../registry/RegistreRuntimeNotifications';
import { RuntimeSupervisionNotifications } from '../monitoring/RuntimeSupervisionNotifications';

// Ce fichier expose la vue de sante du runtime Notifications.

/** Cette classe consolide les etats composants et la supervision technique en sante runtime. */
export class SanteRuntimeNotifications {
  /** Ce constructeur relie la sante au registre runtime et a la supervision technique. */
  constructor(
    private readonly registreRuntimeNotifications: RegistreRuntimeNotifications,
    private readonly runtimeSupervisionNotifications: RuntimeSupervisionNotifications,
  ) {}

  /** Cette methode retourne l'etat global de sante du runtime. */
  public async observer(): Promise<{
    readonly sain: boolean;
    readonly totalComposants: number;
    readonly totalComposantsDegrades: number;
    readonly saturationDetectee: boolean;
    readonly providersIndisponibles: number;
    readonly collecteLe: Date;
  }> {
    const snapshotRuntime = this.registreRuntimeNotifications.observer();
    const supervision = await this.runtimeSupervisionNotifications.superviser();
    const totalComposantsDegrades = snapshotRuntime.composants.filter(
      (composant) => composant.statut === 'DEGRADE',
    ).length;

    return {
      sain: supervision.sain && totalComposantsDegrades === 0,
      totalComposants: snapshotRuntime.composants.length,
      totalComposantsDegrades,
      saturationDetectee: supervision.saturationDetectee,
      providersIndisponibles: supervision.providersIndisponibles,
      collecteLe: new Date(),
    };
  }
}
