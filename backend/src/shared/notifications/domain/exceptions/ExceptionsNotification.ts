/**
 * Cette exception de base represente toute violation metier dans le domaine Notifications.
 */
export class ExceptionDomaineNotification extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExceptionDomaineNotification';
  }
}

/** Cette exception signale une transition de statut interdite. */
export class ExceptionTransitionNotification extends ExceptionDomaineNotification {}

/** Cette exception signale un retry non autorise. */
export class ExceptionRetryNotification extends ExceptionDomaineNotification {}

/** Cette exception signale un traitement demande sur une notification expiree. */
export class ExceptionExpirationNotification extends ExceptionDomaineNotification {}

/** Cette exception signale un traitement demande sur une notification annulee. */
export class ExceptionAnnulationNotification extends ExceptionDomaineNotification {}

/** Cette exception signale un traitement demande sur une notification archivee. */
export class ExceptionArchiveNotification extends ExceptionDomaineNotification {}

/** Cette exception signale une violation d'isolation tenant. */
export class ExceptionViolationTenantNotification extends ExceptionDomaineNotification {}

/** Cette exception signale une violation de securite sur le contenu transporte. */
export class ExceptionSecuriteContenuNotification extends ExceptionDomaineNotification {}

/** Cette exception signale une incoherence de livraison ou de tentative. */
export class ExceptionViolationLivraisonNotification extends ExceptionDomaineNotification {}
