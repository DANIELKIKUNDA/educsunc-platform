// Ce fichier expose le DTO stable d'accuse de reception.

/** Cette interface represente la forme serialisable d'un accuse de reception. */
export interface DtoAccuseReceptionNotification {
  readonly identifiantNotification: string;
  readonly destinataireId: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly marquerCommeLue?: boolean;
  readonly dateAccusee?: string;
}
