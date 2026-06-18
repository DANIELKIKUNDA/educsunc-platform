import { randomUUID } from 'node:crypto';
import { ContexteObservabiliteNotification, TraceNotification } from './TypesObservabiliteNotifications';

// Ce fichier trace les operations techniques du moteur Notifications.

/** Cette classe centralise la creation et la cloture des traces techniques Notifications. */
export class TraceurNotifications {
  private readonly traces = new Map<string, TraceNotification>();

  /** Cette methode ouvre une nouvelle trace technique. */
  public demarrer(
    nomOperation: string,
    categorie: TraceNotification['categorie'],
    contexte: ContexteObservabiliteNotification,
    metadata: Readonly<Record<string, unknown>> = {},
  ): TraceNotification {
    const trace: TraceNotification = {
      identifiantTrace: randomUUID(),
      nomOperation,
      categorie,
      debutLe: new Date(),
      succes: false,
      correlationId: contexte.correlationId,
      requestId: contexte.requestId,
      organisationId: contexte.organisationId,
      ecoleId: contexte.ecoleId,
      metadata: {
        ...contexte.metadata,
        ...metadata,
      },
    };
    this.traces.set(trace.identifiantTrace, trace);
    return trace;
  }

  /** Cette methode cloture une trace technique avec son resultat. */
  public terminer(
    identifiantTrace: string,
    succes: boolean,
    erreur?: string,
    metadata: Readonly<Record<string, unknown>> = {},
  ): TraceNotification | null {
    const precedente = this.traces.get(identifiantTrace);
    if (!precedente) {
      return null;
    }

    const miseAJour: TraceNotification = {
      ...precedente,
      succes,
      erreur,
      termineLe: new Date(),
      metadata: {
        ...precedente.metadata,
        ...metadata,
      },
    };
    this.traces.set(identifiantTrace, miseAJour);
    return miseAJour;
  }

  /** Cette methode retourne toutes les traces actuellement connues. */
  public listerToutes(): TraceNotification[] {
    return [...this.traces.values()];
  }
}
