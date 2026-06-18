import type {
  NotificationBulletinsIntegrationRequest,
  NotificationBulletinsIntent,
  NotificationBulletinsIntegrationSnapshot,
} from '../NotificationsBulletinsIntegrationTypes';
import { NotificationBulletinsAntiCorruptionLayer } from '../acl/NotificationBulletinsAntiCorruptionLayer';
import { NotificationBulletinsEventMapper } from '../mappers/NotificationBulletinsEventMapper';
import { NotificationBulletinsEventPublisher } from '../publishers/NotificationBulletinsEventPublisher';
import { NotificationBulletinsReadBridge } from '../read-models/NotificationBulletinsReadBridge';

// Ce fichier orchestre le pont entre le BC bulletins-evaluations et le module Notifications.

/** Cette classe centralise la traduction des signaux pedagogiques en intentions Notifications. */
export class NotificationsBulletinsIntegrationOrchestrator {
  public readonly acl = new NotificationBulletinsAntiCorruptionLayer();
  public readonly publisher = new NotificationBulletinsEventPublisher();
  public readonly readBridge = new NotificationBulletinsReadBridge();

  /** Cette methode traite un evenement pedagogique et memorise l'intention correspondante. */
  public async traiterEvenement(
    requete: NotificationBulletinsIntegrationRequest,
  ): Promise<NotificationBulletinsIntent | null> {
    const intention = this.acl.traduireEvenement(requete);
    if (intention === null) {
      return null;
    }

    return this.publisher.publier({
      typeEvenementBulletins: requete.evenement.typeEvenement,
      referenceMetier: NotificationBulletinsEventMapper.extraireReferenceMetier(requete.evenement),
      intention,
      publieLe: new Date().toISOString(),
    });
  }

  /** Cette methode expose un snapshot lisible du pont bulletins-evaluations vers Notifications. */
  public obtenirSnapshot(): NotificationBulletinsIntegrationSnapshot {
    return this.readBridge.construireSnapshot(this.publisher.listerRecentes(200));
  }
}
