import { ApplicationException } from './ApplicationException';

// Cette erreur signale une reutilisation incoherente d'une cle idempotente.
export class IdempotencyException extends ApplicationException {
  constructor(message = 'Cette operation a deja ete traitee avec une cle idempotente incompatible.') {
    super(message, 'BULLETINS_IDEMPOTENCY_EXCEPTION');
    this.name = 'IdempotencyException';
  }
}
