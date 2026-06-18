// Ce fichier declare la commande de resolution d une alerte.

/** Cette interface represente la commande de resolution d une alerte. */
export interface ResolveAlertCommand {
  readonly alertId: string;
  readonly resolvedAt?: Date;
}
