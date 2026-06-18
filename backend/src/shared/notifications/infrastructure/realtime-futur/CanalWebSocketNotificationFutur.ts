// Ce fichier declare le futur canal WebSocket technique du module Notifications.

import {
  CanalTempsReelNotification,
  MessageTempsReelNotification,
  ResultatPublicationTempsReelNotification,
} from './TypesTempsReelNotification';

/** Cette classe represente un futur canal WebSocket local et mockable. */
export class CanalWebSocketNotificationFutur implements CanalTempsReelNotification {
  /** Cette liste conserve les publications memorisees pour le futur runtime WebSocket. */
  private readonly publications: MessageTempsReelNotification[] = [];

  /** Ce constructeur fixe si le canal WebSocket futur est actif dans le runtime local. */
  constructor(private readonly actif = false) {}

  /** Cette methode retourne le nom stable du canal WebSocket futur. */
  public obtenirNom(): string {
    return 'WEBSOCKET_FUTUR';
  }

  /** Cette methode indique si le canal WebSocket est disponible. */
  public estDisponible(): boolean {
    return this.actif;
  }

  /** Cette methode memorise une publication WebSocket future si le canal est actif. */
  public async publier(
    message: MessageTempsReelNotification,
  ): Promise<ResultatPublicationTempsReelNotification> {
    if (!this.actif) {
      return {
        canal: this.obtenirNom(),
        succes: false,
        publieLe: new Date(),
        raison: 'Le canal WebSocket futur est desactive dans ce runtime local.',
      };
    }

    this.publications.push(message);
    return {
      canal: this.obtenirNom(),
      succes: true,
      publieLe: new Date(),
    };
  }

  /** Cette methode retourne les publications memorisees par le canal WebSocket futur. */
  public lirePublications(): readonly MessageTempsReelNotification[] {
    return this.publications;
  }
}
