import type {
  DtoDetailsNotification,
  ModeleLectureDetailsNotification,
  ModeleLectureListeNotifications,
} from '../../../application';
import type {
  DtoHttpDetailsNotification,
  DtoHttpNotification,
} from '../dto/outputs';

// Ce fichier declare le presentateur HTTP principal du module Notifications.

/** Cette classe transforme les vues liste/detail en sorties HTTP stables. */
export class PresentateurHttpNotification {
  /** Cette methode presente un detail issu d'un DTO applicatif. */
  public static presenterDetail(dto: DtoDetailsNotification): DtoHttpDetailsNotification {
    return { ...dto };
  }

  /** Cette methode presente un detail issu d'un modele de lecture. */
  public static presenterProjectionDetail(
    modele: ModeleLectureDetailsNotification,
  ): DtoHttpDetailsNotification {
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

  /** Cette methode presente une liste paginee de notifications. */
  public static presenterListe(modele: ModeleLectureListeNotifications): {
    readonly elements: readonly DtoHttpNotification[];
    readonly page: number;
    readonly taillePage: number;
    readonly total: number;
  } {
    return {
      elements: modele.elements.map((element) => ({
        identifiant: element.identifiant,
        type: element.type,
        statut: element.statut,
        titre: element.titre,
        messageResume: element.messageResume,
        creeLe: element.creeLe.toISOString(),
      })),
      page: modele.page,
      taillePage: modele.taillePage,
      total: modele.total,
    };
  }
}
