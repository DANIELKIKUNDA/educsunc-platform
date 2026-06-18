// Ce fichier expose le DTO stable de rejeu de notification.

/** Cette interface represente la forme serialisable d'une demande de rejeu. */
export interface DtoRejeuNotification {
  readonly identifiantNotification: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly raison: string;
  readonly autoriserRenduCanal?: boolean;
  readonly rebatirChronologie?: boolean;
}
