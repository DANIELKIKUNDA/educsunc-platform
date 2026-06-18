// Ce fichier declare les types techniques du bloc observability Notifications.

/** Cette interface represente le contexte de correlation a propager entre composants. */
export interface ContexteObservabiliteNotification {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly acteurId?: string;
  readonly source?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente une trace technique du moteur Notifications. */
export interface TraceNotification {
  readonly identifiantTrace: string;
  readonly nomOperation: string;
  readonly categorie: 'QUEUE' | 'PROVIDER' | 'RETRY' | 'REPLAY' | 'STORAGE' | 'REALTIME' | 'GENERAL';
  readonly debutLe: Date;
  readonly termineLe?: Date;
  readonly succes: boolean;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly erreur?: string;
}

/** Cette interface represente une entree de journal d'observabilite. */
export interface EntreeJournalObservabiliteNotification {
  readonly identifiant: string;
  readonly niveau: 'INFO' | 'WARN' | 'ERROR';
  readonly message: string;
  readonly horodatage: Date;
  readonly contexte: ContexteObservabiliteNotification;
}
