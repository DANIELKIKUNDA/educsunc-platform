import {
  RapportSanteProviderNotification,
} from '../../infrastructure/providers';
import {
  OperationRecuperationNotification,
  RecuperationProvidersNotifications,
} from '../../infrastructure/recovery';

// Ce fichier expose le runtime specialise de recovery des providers Notifications.

/** Cette classe specialisa les controles de sante providers dans le runtime. */
export class RuntimeRecoveryProviders {
  /** Ce constructeur relie le runtime au recuperateur technique des providers. */
  constructor(private readonly recuperationProvidersNotifications: RecuperationProvidersNotifications) {}

  /** Cette methode verifie la sante globale des providers. */
  public async verifierSante(): Promise<OperationRecuperationNotification> {
    return this.recuperationProvidersNotifications.verifierSante();
  }

  /** Cette methode liste les providers encore recuperables. */
  public async listerRecuperables(): Promise<readonly RapportSanteProviderNotification[]> {
    return this.recuperationProvidersNotifications.listerProvidersRecuperables();
  }
}
