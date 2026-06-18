// Ce fichier declare le DTO HTTP de contexte Monitoring.

/** Cette interface represente le contexte Monitoring passe par HTTP. */
export interface DtoHttpMonitoringContext {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurId?: string;
  readonly module?: string;
  readonly composant?: string;
  readonly correlationId?: string;
}
