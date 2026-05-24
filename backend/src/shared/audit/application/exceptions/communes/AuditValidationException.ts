import { AuditApplicationException } from './AuditApplicationException';

// Cette exception specialise un scenario d'erreur applicative Audit.
export class AuditValidationException extends AuditApplicationException {}
