// Ce fichier declare le futur canal SSE technique du module Notifications.

import {
  CanalTempsReelNotification,
  MessageTempsReelNotification,
  ResultatPublicationTempsReelNotification,
} from './TypesTempsReelNotification';

/** Cette classe represente un futur canal SSE local et mockable. */
export class CanalSseNotificationFutur implements CanalTempsReelNotification {
  /** Cette liste conserve les publications memorisees pour les usages techniques futurs. */
  private readonly publications: MessageTempsReelNotification[] = [];

  /** Ce constructeur fixe si le canal SSE futur est actif dans le runtime local. */
  constructor(private readonly actif = false) {}

  /** Cette methode retourne le nom stable du canal SSE futur. */
  public obtenirNom(): string {
    return 'SSE_FUTUR';
  }

  /** Cette methode indique si le canal SSE est disponible. */
  public estDisponible(): boolean {
    return this.actif;
  }

  /** Cette methode memorise une publication SSE future si le canal est actif. */
  public async publier(
    message: MessageTempsReelNotification,
  ): Promise<ResultatPublicationTempsReelNotification> {
    if (!this.actif) {
      return {
        canal: this.obtenirNom(),
        succes: false,
        publieLe: new Date(),
        raison: 'Le canal SSE futur est desactive dans ce runtime local.',
      };
    }

    this.publications.push(message);
    return {
      canal: this.obtenirNom(),
      succes: true,
      publieLe: new Date(),
    };
  }

  /** Cette methode retourne les publications memorisees par le canal SSE futur. */
  public lirePublications(): readonly MessageTempsReelNotification[] {
    return this.publications;
  }
}
