// Ce fichier expose le DTO stable d'une entree dead letter Notifications.

/** Cette interface represente la vue serialisable d'une entree dead letter. */
export interface DtoDeadLetterNotification {
  readonly identifiantNotification: string;
  readonly raison: string;
  readonly dateEntree: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly tenant?: {
    readonly organisationId?: string;
    readonly ecoleId?: string;
  };
}
