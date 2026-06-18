import { RuntimePlanificationNotifications } from '../scheduler/RuntimePlanificationNotifications';
import { RuntimeThrottlingNotifications } from '../throttling/RuntimeThrottlingNotifications';
import { CleThrottlingNotification } from '../../infrastructure/throttling';

// Ce fichier declare le coordinateur runtime des files Notifications.

/** Cette classe orchestre la planification et la regulation des emissions vers les files. */
export class CoordinateurFilesNotifications {
  /** Ce constructeur relie le coordinateur au scheduler runtime et au throttling. */
  constructor(
    private readonly runtimePlanificationNotifications: RuntimePlanificationNotifications,
    private readonly runtimeThrottlingNotifications: RuntimeThrottlingNotifications,
  ) {}

  /** Cette methode controle la pression runtime avant une planification de dispatch. */
  public async controlerEtPlanifierDispatch(
    cle: CleThrottlingNotification,
    identifiantNotification: string,
    executeLe: Date,
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<{ readonly autorise: boolean; readonly raison?: string }> {
    const controle = await this.runtimeThrottlingNotifications.consommer(cle);
    if (!controle.autorise) {
      return {
        autorise: false,
        raison: controle.raison,
      };
    }

    await this.runtimePlanificationNotifications.planifierDispatch(
      identifiantNotification,
      executeLe,
      metadata,
    );

    return {
      autorise: true,
    };
  }
}
