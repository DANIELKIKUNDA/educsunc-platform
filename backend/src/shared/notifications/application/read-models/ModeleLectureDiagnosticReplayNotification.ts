// Ce fichier decrit le modele de lecture de diagnostic de rejeu.

/** Cette interface represente la vue de diagnostic de rejeu d'une notification. */
export interface ModeleLectureDiagnosticReplayNotification {
  readonly identifiantNotification: string;
  readonly totalReplays: number;
  readonly dernierReplayLe?: Date;
  readonly dernierReplayPar?: string;
  readonly rebatirChronologie: boolean;
  readonly autoriserRenduCanal: boolean;
}
