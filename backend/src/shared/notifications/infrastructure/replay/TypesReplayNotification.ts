// Ce fichier declare les types techniques du bloc replay Notifications.

/** Cette interface represente une tentative technique de rejeu. */
export interface EntreeReplayNotification {
  readonly identifiantReplay: string;
  readonly identifiantNotification: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly raison?: string;
  readonly acteur?: string;
  readonly rebatirChronologie: boolean;
  readonly autoriserRenduCanal: boolean;
  readonly demarreLe: Date;
  readonly termineLe?: Date;
  readonly succes: boolean;
  readonly erreur?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente le resultat d'execution d'un rejeu technique. */
export interface ResultatExecutionReplayNotification {
  readonly identifiantNotification: string;
  readonly identifiantReplay: string;
  readonly succes: boolean;
  readonly message: string;
  readonly horodatage: Date;
}
