import { Notification } from '../../domain';
import { DtoDetailsNotification } from '../dto';
import { ModeleLectureDetailsNotification } from '../read-models';

// Ce fichier transforme une notification ou sa projection en DTO de sortie.

/** Cette classe convertit les vues domaine ou lecture en DTO expose. */
export class MappeurNotificationVersDto {
  /** Cette methode convertit la projection detaillee en DTO stable. */
  public static depuisModeleLecture(modele: ModeleLectureDetailsNotification): DtoDetailsNotification {
    return {
      identifiant: modele.identifiant,
      type: modele.type,
      statut: modele.statut,
      priorite: modele.priorite,
      canaux: modele.canaux,
      titre: modele.titre,
      message: modele.message,
      organisationId: modele.organisationId,
      ecoleId: modele.ecoleId,
      creeLe: modele.creeLe.toISOString(),
      misAJourLe: modele.misAJourLe.toISOString(),
    };
  }

  /** Cette methode convertit directement l'agregat quand aucune projection n'est disponible. */
  public static depuisAgregat(notification: Notification): DtoDetailsNotification {
    const vueInterne = notification as unknown as {
      canaux: DtoDetailsNotification['canaux'];
      contenu: {
        obtenirMessage(): string;
        obtenirTitre?: () => string | undefined;
      };
    };

    return {
      identifiant: notification.obtenirIdentifiant().obtenirValeur(),
      type: notification.type,
      statut: notification.obtenirStatut(),
      priorite: notification.priorite,
      canaux: [...vueInterne.canaux],
      titre: vueInterne.contenu.obtenirTitre?.() ?? undefined,
      message: vueInterne.contenu.obtenirMessage(),
      organisationId: notification.contexte.obtenirOrganisationId(),
      ecoleId: notification.contexte.obtenirEcoleId(),
      creeLe: notification.creeLe.toISOString(),
      misAJourLe: notification.misAJourLe.toISOString(),
    };
  }
}
