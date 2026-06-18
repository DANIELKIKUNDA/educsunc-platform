import type {
  NotificationReferentielIntegrationRequest,
  NotificationReferentielIntent,
  NotificationReferentielIntegrationSnapshot,
} from '../NotificationsReferentielIntegrationTypes';
import { NotificationReferentielAntiCorruptionLayer } from '../acl/NotificationReferentielAntiCorruptionLayer';
import { NotificationReferentielEventMapper } from '../mappers/NotificationReferentielEventMapper';
import { NotificationReferentielEventPublisher } from '../publishers/NotificationReferentielEventPublisher';
import { NotificationReferentielReadBridge } from '../read-models/NotificationReferentielReadBridge';

// Ce fichier orchestre le pont entre le BC referentiel-academique et le module Notifications.

/** Cette classe centralise la traduction des signaux de referentiel en intentions Notifications. */
export class NotificationsReferentielIntegrationOrchestrator {
  public readonly acl = new NotificationReferentielAntiCorruptionLayer();
  public readonly publisher = new NotificationReferentielEventPublisher();
  public readonly readBridge = new NotificationReferentielReadBridge();

  /** Cette methode traite un evenement de referentiel et memorise l'intention correspondante. */
  public async traiterEvenement(
    requete: NotificationReferentielIntegrationRequest,
  ): Promise<NotificationReferentielIntent | null> {
    const intention = this.acl.traduireEvenement(requete);
    if (intention === null) {
      return null;
    }

    return this.publisher.publier({
      typeEvenementReferentiel: requete.evenement.typeEvenement,
      referenceMetier: NotificationReferentielEventMapper.extraireReferenceMetier(requete.evenement),
      intention,
      publieLe: new Date().toISOString(),
    });
  }

  /** Cette methode expose un snapshot lisible du pont referentiel-academique vers Notifications. */
  public obtenirSnapshot(): NotificationReferentielIntegrationSnapshot {
    return this.readBridge.construireSnapshot(this.publisher.listerRecentes(200));
  }
}
