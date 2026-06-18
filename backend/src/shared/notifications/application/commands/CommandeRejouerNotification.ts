// Ce fichier decrit la commande applicative de rejeu d'une notification.

/** Cette interface porte l'intention de rejeu technique d'une notification. */
export interface CommandeRejouerNotification {
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
