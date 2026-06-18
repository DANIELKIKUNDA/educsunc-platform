import type {
  NotificationPaiementsIntegrationRequest,
  NotificationPaiementsIntent,
  NotificationPaiementsIntegrationSnapshot,
  NotificationPaiementsLegacyRequest,
} from '../NotificationsPaiementsIntegrationTypes';
import { NotificationPaiementsAntiCorruptionLayer } from '../acl/NotificationPaiementsAntiCorruptionLayer';
import { NotificationPaiementsEventMapper } from '../mappers/NotificationPaiementsEventMapper';
import { NotificationPaiementsEventPublisher } from '../publishers/NotificationPaiementsEventPublisher';
import { NotificationPaiementsReadBridge } from '../read-models/NotificationPaiementsReadBridge';

// Ce fichier orchestre le pont entre le BC paiements-facturation et le module Notifications.

/** Cette classe centralise la traduction des signaux financiers en intentions Notifications. */
export class NotificationsPaiementsIntegrationOrchestrator {
  public readonly acl = new NotificationPaiementsAntiCorruptionLayer();
  public readonly publisher = new NotificationPaiementsEventPublisher();
  public readonly readBridge = new NotificationPaiementsReadBridge();

  private totalDemandesLegacy = 0;

  /** Cette methode traite un evenement financier et memorise l'intention correspondante. */
  public async traiterEvenement(
    requete: NotificationPaiementsIntegrationRequest,
  ): Promise<NotificationPaiementsIntent | null> {
    const intention = this.acl.traduireEvenement(requete);
    if (intention === null) {
      return null;
    }

    return this.publisher.publier({
      typeEvenementPaiement: requete.evenement.typeEvenement,
      referenceMetier: NotificationPaiementsEventMapper.extraireReferenceMetier(requete.evenement),
      intention,
      publieLe: new Date().toISOString(),
    });
  }

  /** Cette methode traite une demande legacy du port NotificationPort du BC financier. */
  public async traiterDemandeLegacy(
    requete: NotificationPaiementsLegacyRequest,
  ): Promise<NotificationPaiementsIntent> {
    this.totalDemandesLegacy += 1;
    const intention = this.acl.traduireDemandeLegacy(requete);

    return this.publisher.publier({
      typeEvenementPaiement: 'NotificationPaiementLegacy',
      referenceMetier: requete.notification.idPaiement,
      intention,
      publieLe: new Date().toISOString(),
    });
  }

  /** Cette methode expose un snapshot lisible du pont paiements-facturation vers Notifications. */
  public obtenirSnapshot(): NotificationPaiementsIntegrationSnapshot {
    return this.readBridge.construireSnapshot(
      this.publisher.listerRecentes(200),
      this.totalDemandesLegacy,
    );
  }
}
