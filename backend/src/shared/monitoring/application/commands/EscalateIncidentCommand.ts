// Ce fichier declare la commande d escalade d un incident.

/** Cette interface represente la commande d escalade d un incident. */
export interface EscalateIncidentCommand {
  readonly incidentId: string;
}
