// Ce fichier declare les types techniques du bloc retry Notifications.

/** Cette interface represente une tentative technique de retry. */
export interface EntreeRetryNotification {
  readonly identifiantRetry: string;
  readonly identifiantNotification: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly raison?: string;
  readonly action?: string;
  readonly tentative: number;
  readonly maximumRetry?: number;
  readonly planifieLe: Date;
  readonly executeLe?: Date;
  readonly succes: boolean;
  readonly erreur?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente le resultat d'execution d'un retry technique. */
export interface ResultatExecutionRetryNotification {
  readonly identifiantNotification: string;
  readonly identifiantRetry: string;
  readonly succes: boolean;
  readonly message: string;
  readonly horodatage: Date;
}
