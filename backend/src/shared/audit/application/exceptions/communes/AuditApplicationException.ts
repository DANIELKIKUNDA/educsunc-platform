// Cette exception applicative de base unifie les erreurs du BC Audit.
export class AuditApplicationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuditApplicationException';
  }
}
