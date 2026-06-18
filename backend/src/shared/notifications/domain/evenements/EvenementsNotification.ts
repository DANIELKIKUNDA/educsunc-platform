import { EvenementDomaine } from '../../../domain/DomainEvent';
import { CanalNotification, TypeNotification } from '../enumerations';

/**
 * Cette classe de base porte les informations communes a tous les evenements du domaine Notifications.
 */
abstract class EvenementNotificationDomaine extends EvenementDomaine {
  /**
   * Ce constructeur fixe l'identifiant metier concerne par l'evenement.
   */
  constructor(typeEvenement: string, public readonly identifiantNotification: string) {
    super(typeEvenement);
  }
}

/** Cet evenement signale la creation officielle d'une notification. */
export class EvenementNotificationCreee extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string, public readonly typeNotification: TypeNotification) {
    super('EvenementNotificationCreee', identifiantNotification);
  }
}

/** Cet evenement signale la validation de la notification. */
export class EvenementNotificationValidee extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string) { super('EvenementNotificationValidee', identifiantNotification); }
}

/** Cet evenement signale l'entree dans la file asynchrone. */
export class EvenementNotificationMiseEnFile extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string) { super('EvenementNotificationMiseEnFile', identifiantNotification); }
}

/** Cet evenement signale le debut de traitement runtime. */
export class EvenementNotificationProcessingDemarre extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string) { super('EvenementNotificationProcessingDemarre', identifiantNotification); }
}

/** Cet evenement signale le debut d'une tentative de livraison. */
export class EvenementTentativeLivraisonDemarree extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string, public readonly canal: CanalNotification) {
    super('EvenementTentativeLivraisonDemarree', identifiantNotification);
  }
}

/** Cet evenement signale une livraison reussie. */
export class EvenementNotificationEnvoyee extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string, public readonly canal: CanalNotification) {
    super('EvenementNotificationEnvoyee', identifiantNotification);
  }
}

/** Cet evenement signale un echec de livraison. */
export class EvenementNotificationEchecLivraison extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string, public readonly canal: CanalNotification, public readonly erreur: string) {
    super('EvenementNotificationEchecLivraison', identifiantNotification);
  }
}

/** Cet evenement signale la planification d'un retry. */
export class EvenementNotificationRetryPlanifiee extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string) { super('EvenementNotificationRetryPlanifiee', identifiantNotification); }
}

/** Cet evenement signale le demarrage effectif d'un retry. */
export class EvenementNotificationRetryDemarre extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string) { super('EvenementNotificationRetryDemarre', identifiantNotification); }
}

/** Cet evenement signale le demarrage d'un fallback. */
export class EvenementNotificationFallbackDemarre extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string) { super('EvenementNotificationFallbackDemarre', identifiantNotification); }
}

/** Cet evenement signale l'expiration definitive d'une notification. */
export class EvenementNotificationExpiree extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string) { super('EvenementNotificationExpiree', identifiantNotification); }
}

/** Cet evenement signale le demarrage d'un replay technique. */
export class EvenementNotificationReplayDemarre extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string) { super('EvenementNotificationReplayDemarre', identifiantNotification); }
}

/** Cet evenement signale la fin d'un replay technique. */
export class EvenementNotificationReplayTermine extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string) { super('EvenementNotificationReplayTermine', identifiantNotification); }
}

/** Cet evenement signale l'archivage final de la notification. */
export class EvenementNotificationArchivee extends EvenementNotificationDomaine {
  constructor(identifiantNotification: string) { super('EvenementNotificationArchivee', identifiantNotification); }
}
