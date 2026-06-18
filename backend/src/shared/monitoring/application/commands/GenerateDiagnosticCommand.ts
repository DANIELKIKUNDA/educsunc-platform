// Ce fichier declare la commande de generation d un diagnostic.

/** Cette interface represente la commande de generation d un diagnostic. */
export interface GenerateDiagnosticCommand {
  readonly incidentId: string;
  readonly traceIds?: readonly string[];
}
