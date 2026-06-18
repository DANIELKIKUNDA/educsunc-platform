// Ce fichier propage les identifiants de correlation et de requete du moteur Notifications.

import { ContexteObservabiliteNotification } from './TypesObservabiliteNotifications';

/** Cette classe consolide le contexte minimal d'observabilite a travers les composants. */
export class PropagateurCorrelationNotifications {
  /** Cette methode fusionne un contexte existant et des metadonnees ponctuelles. */
  public propager(
    contexte: Partial<ContexteObservabiliteNotification>,
    metadata: Readonly<Record<string, unknown>> = {},
  ): ContexteObservabiliteNotification {
    return {
      organisationId: contexte.organisationId,
      ecoleId: contexte.ecoleId,
      correlationId: contexte.correlationId,
      requestId: contexte.requestId,
      acteurId: contexte.acteurId,
      source: contexte.source,
      metadata: {
        ...(contexte.metadata ?? {}),
        ...metadata,
      },
    };
  }
}
