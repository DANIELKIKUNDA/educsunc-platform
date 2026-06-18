// Ce fichier decrit la commande applicative d'accuse de reception.

/** Cette interface porte la confirmation metier de reception ou de lecture. */
export interface CommandeAccuserReceptionNotification {
  readonly identifiantNotification: string;
  readonly destinataireId: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly marquerCommeLue?: boolean;
  readonly dateAccusee?: Date;
}
