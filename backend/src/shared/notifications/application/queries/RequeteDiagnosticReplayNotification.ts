// Ce fichier decrit la requete applicative de diagnostic de rejeu.

/** Cette interface porte les informations minimales pour diagnostiquer un rejeu. */
export interface RequeteDiagnosticReplayNotification {
  readonly identifiantNotification: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}
