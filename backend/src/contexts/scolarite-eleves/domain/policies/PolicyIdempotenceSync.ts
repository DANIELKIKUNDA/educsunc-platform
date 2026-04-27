import { ErreurCleIdempotenceManquante } from '../exceptions/ErreurCleIdempotenceManquante';
import { ErreurPayloadIdempotenceDifferent } from '../exceptions/ErreurPayloadIdempotenceDifferent';

// Ce fichier contient la regle d'idempotence des commandes synchronisables.
/**
 * Cette policy garantit qu'une meme cle idempotente ne porte pas deux intentions differentes.
 */
export class PolicyIdempotenceSync {
  /** Verifie que la cle d'idempotence est presente. */
  public verifierClePresente(cleIdempotence?: string): string {
    if (cleIdempotence === undefined || cleIdempotence.trim().length === 0) {
      throw new ErreurCleIdempotenceManquante('La cle d idempotence est obligatoire.');
    }

    return cleIdempotence.trim();
  }

  /** Refuse un rejeu idempotent avec un payload different. */
  public verifierPayloadIdentique(payloadIdentique: boolean): void {
    if (!payloadIdentique) {
      throw new ErreurPayloadIdempotenceDifferent('La meme cle d idempotence porte un payload different.');
    }
  }
}
