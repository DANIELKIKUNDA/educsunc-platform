import { AuditValidationException } from '../communes/AuditValidationException';

// Cette exception specialise un scenario d'erreur applicative Audit.
export class AuditCorrelationMissingException extends AuditValidationException {}
