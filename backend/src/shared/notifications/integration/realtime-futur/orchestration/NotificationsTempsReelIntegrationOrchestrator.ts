import {
  CanalSseNotificationFutur,
  CanalWebSocketNotificationFutur,
  DiffuseurTempsReelNotification,
  type MessageTempsReelNotification,
} from '../../../infrastructure/realtime-futur';
import type {
  NotificationTempsReelIntegrationSnapshot,
  NotificationTempsReelIntegrationRequest,
  NotificationTempsReelEvent,
} from '../NotificationsTempsReelIntegrationTypes';
import { NotificationTempsReelContractBridge } from '../contracts/NotificationTempsReelContractBridge';
import { NotificationTempsReelEventMapper } from '../mappers/NotificationTempsReelEventMapper';
import { NotificationTempsReelEventPublisher } from '../publishers/NotificationTempsReelEventPublisher';

// Ce fichier orchestre le pont entre Notifications et le futur temps reel transverse.

/** Cette classe centralise la diffusion logique temps reel et l'exposition des capacites du pont. */
export class NotificationsTempsReelIntegrationOrchestrator {
  public readonly publisher = new NotificationTempsReelEventPublisher();
  public readonly contracts = new NotificationTempsReelContractBridge();

  private totalErreursPublication = 0;
  private publicationActive = true;

  /** Ce constructeur assemble le diffuseur technique et les canaux temps reel futurs. */
  constructor(
    private readonly canalSseNotificationFutur = new CanalSseNotificationFutur(),
    private readonly canalWebSocketNotificationFutur = new CanalWebSocketNotificationFutur(),
    private readonly diffuseurTempsReelNotification = new DiffuseurTempsReelNotification([
      canalSseNotificationFutur,
      canalWebSocketNotificationFutur,
    ]),
  ) {}

  /** Cette methode publie une demande logique vers le futur temps reel. */
  public async publier(
    demande: NotificationTempsReelIntegrationRequest,
  ): Promise<void> {
    this.publisher.publier(demande);

    try {
      await this.diffuseurTempsReelNotification.publier(
        demande.sujet,
        NotificationTempsReelEventMapper.versChargePublication(demande),
      );
    } catch (erreur) {
      this.totalErreursPublication += 1;
      throw erreur;
    }
  }

  /** Cette methode absorbe un evenement de confirmation ou d'etat provenant du pont temps reel. */
  public async enregistrerEvenement(evenement: NotificationTempsReelEvent): Promise<void> {
    if (evenement.type === 'PUBLICATION_ECHOUEE') {
      this.totalErreursPublication += 1;
      return;
    }

    if (evenement.type === 'CAPABILITES_ANNONCEES') {
      this.publicationActive = evenement.metadata.publicationActive !== false;
    }
  }

  /** Cette methode expose le snapshot du pont temps reel Notifications. */
  public obtenirSnapshot(): NotificationTempsReelIntegrationSnapshot {
    const dernieresPublications = this.publisher.listerRecentes(100);
    const derniersMessagesTechniques = this.lireMessagesTechniques();

    return {
      capabilities: this.contracts.construireCapacites({
        publicationActive: this.publicationActive,
        sseDisponible: this.canalSseNotificationFutur.estDisponible(),
        webSocketDisponible: this.canalWebSocketNotificationFutur.estDisponible(),
        totalPublications: dernieresPublications.length,
      }),
      dernieresPublications,
      derniersMessagesTechniques,
      totalErreursPublication: this.totalErreursPublication,
    };
  }

  /** Cette methode retourne les messages techniques deja conserves par le diffuseur local. */
  private lireMessagesTechniques(): readonly MessageTempsReelNotification[] {
    return this.diffuseurTempsReelNotification.lirePublications();
  }
}
