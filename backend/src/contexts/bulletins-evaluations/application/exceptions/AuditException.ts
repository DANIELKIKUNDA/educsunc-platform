import { ApplicationException } from './ApplicationException';

// Cette erreur signale un incident dans la tracabilite applicative.
export class AuditException extends ApplicationException {
  constructor(message = 'L ecriture de la trace d audit a echoue.') {
    super(message, 'BULLETINS_AUDIT_EXCEPTION');
    this.name = 'AuditException';
  }
}
