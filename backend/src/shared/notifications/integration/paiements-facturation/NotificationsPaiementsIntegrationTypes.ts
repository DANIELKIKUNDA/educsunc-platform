import type { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import type { DtoCommandeCreationNotification } from '../../application/dto';

// Ce fichier declare les types partages du pont entre le BC paiements-facturation et Notifications.

/** Cette interface represente une demande d'integration issue d'un evenement financier. */
export interface NotificationPaiementsIntegrationRequest {
  readonly evenement: EvenementDomaine;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly acteurId?: string;
  readonly destinataires?: DtoCommandeCreationNotification['destinataires'];
  readonly titre?: string;
  readonly message?: string;
  readonly canaux?: DtoCommandeCreationNotification['canaux'];
  readonly metadonnees?: Readonly<Record<string, unknown>>;
}

/** Cette interface represente une intention de notification derivee du BC paiements-facturation. */
export interface NotificationPaiementsIntent {
  readonly typeEvenementPaiement: string;
  readonly referenceMetier?: string;
  readonly intention: DtoCommandeCreationNotification;
  readonly publieLe: string;
}

/** Cette interface represente le contrat minimal qu un evenement paiements doit exposer ici. */
export interface NotificationPaiementsEvenementLike extends EvenementDomaine {
  readonly idPaiement?: string;
  readonly idObligation?: string;
  readonly idRestitution?: string;
  readonly idEleve?: string;
  readonly idEcole?: string;
  readonly declenchePar?: string;
}

/** Cette interface represente le contrat legacy minimal requis pour une notification paiement. */
export interface NotificationPaiementLegacyPayload {
  readonly idPaiement: string;
  readonly idEleve: string;
  readonly idEcole?: string;
  readonly message: string;
}

/** Cette interface represente une demande legacy venant du port NotificationPort du BC financier. */
export interface NotificationPaiementsLegacyRequest {
  readonly notification: NotificationPaiementLegacyPayload;
  readonly organisationId?: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly metadonnees?: Readonly<Record<string, unknown>>;
}

/** Cette interface represente le snapshot local du pont paiements-facturation vers Notifications. */
export interface NotificationPaiementsIntegrationSnapshot {
  readonly totalIntentions: number;
  readonly totalDemandesLegacy: number;
  readonly totalParEvenement: Readonly<Record<string, number>>;
  readonly totalParTypeNotification: Readonly<Record<string, number>>;
}
