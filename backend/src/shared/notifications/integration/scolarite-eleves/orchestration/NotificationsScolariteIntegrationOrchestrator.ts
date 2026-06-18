import type {
  NotificationScolariteCommunicationRequest,
  NotificationScolariteIntegrationRequest,
  NotificationScolariteIntent,
  NotificationScolariteIntegrationSnapshot,
} from '../NotificationsScolariteIntegrationTypes';
import { NotificationScolariteAntiCorruptionLayer } from '../acl/NotificationScolariteAntiCorruptionLayer';
import { NotificationScolariteEventMapper } from '../mappers/NotificationScolariteEventMapper';
import { NotificationScolariteEventPublisher } from '../publishers/NotificationScolariteEventPublisher';
import { NotificationScolariteReadBridge } from '../read-models/NotificationScolariteReadBridge';

// Ce fichier orchestre le pont entre le BC scolarite-eleves et le module Notifications.

/** Cette classe centralise la traduction des signaux de scolarite en intentions Notifications. */
export class NotificationsScolariteIntegrationOrchestrator {
  public readonly acl = new NotificationScolariteAntiCorruptionLayer();
  public readonly publisher = new NotificationScolariteEventPublisher();
  public readonly readBridge = new NotificationScolariteReadBridge();

  private totalDemandesLegacy = 0;

  /** Cette methode traite un evenement de scolarite et memorise l'intention correspondante. */
  public async traiterEvenement(
    requete: NotificationScolariteIntegrationRequest,
  ): Promise<NotificationScolariteIntent | null> {
    const intention = this.acl.traduireEvenement(requete);
    if (intention === null) {
      return null;
    }

    return this.publisher.publier({
      typeEvenementScolarite: requete.evenement.typeEvenement,
      referenceMetier: NotificationScolariteEventMapper.extraireReferenceMetier(requete.evenement),
      intention,
      publieLe: new Date().toISOString(),
    });
  }

  /** Cette methode traite une demande legacy de communication du BC scolarite-eleves. */
  public async traiterDemandeCommunication(
    requete: NotificationScolariteCommunicationRequest,
  ): Promise<NotificationScolariteIntent> {
    this.totalDemandesLegacy += 1;
    const intention = this.acl.traduireDemandeCommunication(requete);

    return this.publisher.publier({
      typeEvenementScolarite: 'NotificationScolariteLegacy',
      referenceMetier: requete.notification.destinataire,
      intention,
      publieLe: new Date().toISOString(),
    });
  }

  /** Cette methode expose un snapshot lisible du pont scolarite-eleves vers Notifications. */
  public obtenirSnapshot(): NotificationScolariteIntegrationSnapshot {
    return this.readBridge.construireSnapshot(
      this.publisher.listerRecentes(200),
      this.totalDemandesLegacy,
    );
  }
}
