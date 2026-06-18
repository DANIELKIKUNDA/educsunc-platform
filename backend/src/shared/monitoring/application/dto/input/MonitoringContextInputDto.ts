// Ce fichier declare le DTO d entree de contexte Monitoring.

/** Cette interface represente un contexte applicatif de monitoring. */
export interface MonitoringContextInputDto {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurId?: string;
  readonly module?: string;
  readonly composant?: string;
  readonly correlationId?: string;
}
