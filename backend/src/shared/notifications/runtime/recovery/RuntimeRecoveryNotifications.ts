import {
  OperationRecuperationNotification,
  RecuperationDeadLetterNotifications,
  RecuperationProvidersNotifications,
  RecuperationQueuesNotifications,
  RecuperationStockageNotifications,
  RecuperationTenantNotifications,
} from '../../infrastructure/recovery';

// Ce fichier expose le runtime de recovery global du module Notifications.

/** Cette classe coordonne une passe complete de recovery technique. */
export class RuntimeRecoveryNotifications {
  /** Ce constructeur assemble les recuperateurs techniques reutilisables du runtime. */
  constructor(
    private readonly recuperationQueuesNotifications: RecuperationQueuesNotifications,
    private readonly recuperationStockageNotifications: RecuperationStockageNotifications,
    private readonly recuperationProvidersNotifications: RecuperationProvidersNotifications,
    private readonly recuperationTenantNotifications: RecuperationTenantNotifications,
    private readonly recuperationDeadLetterNotifications: RecuperationDeadLetterNotifications,
  ) {}

  /** Cette methode execute une passe globale de recovery. */
  public async executerPasse(): Promise<readonly OperationRecuperationNotification[]> {
    return [
      this.recuperationQueuesNotifications.nettoyerJobsInvalides(),
      this.recuperationStockageNotifications.verifierCoherence(),
      await this.recuperationProvidersNotifications.verifierSante(),
      this.construireOperationTenantContextualisee(),
      await this.recuperationDeadLetterNotifications.rejouerDepuisDeadLetter(),
    ];
  }

  /** Cette methode represente la garde tenant-aware globale quand aucun contexte cible n'est fourni. */
  private construireOperationTenantContextualisee(): OperationRecuperationNotification {
    void this.recuperationTenantNotifications;
    return {
      cible: 'TENANT',
      succes: true,
      recupereLe: new Date(),
      raison: 'La verification tenant globale est delegatee aux controles contextualises.',
      elementsTraites: 0,
      metadata: {
        mode: 'contextualise',
      },
    };
  }
}
