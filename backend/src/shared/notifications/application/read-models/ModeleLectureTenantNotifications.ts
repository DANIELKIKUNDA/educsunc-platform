// Ce fichier decrit le modele de lecture consolide des notifications par tenant.

/** Cette interface represente une vue consolidee des notifications d'un tenant. */
export interface ModeleLectureTenantNotifications {
  readonly organisationId: string;
  readonly ecoleId?: string;
  readonly totalNotifications: number;
  readonly totalArchivees: number;
  readonly totalDeadLetters: number;
  readonly totalEnEchec: number;
  readonly dateObservation: Date;
}
