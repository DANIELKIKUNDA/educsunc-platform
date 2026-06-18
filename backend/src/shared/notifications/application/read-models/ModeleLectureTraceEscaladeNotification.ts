// Ce fichier decrit le modele de lecture de trace d'escalade.

/** Cette interface represente une trace projete d'escalade. */
export interface ElementTraceEscaladeNotification {
  readonly identifiant: string;
  readonly raison: string;
  readonly acteur?: string;
  readonly horodatage: Date;
  readonly audienceCible: readonly string[];
}

/** Cette interface represente l'historique d'escalade d'une notification. */
export interface ModeleLectureTraceEscaladeNotification {
  readonly identifiantNotification: string;
  readonly elements: readonly ElementTraceEscaladeNotification[];
}
