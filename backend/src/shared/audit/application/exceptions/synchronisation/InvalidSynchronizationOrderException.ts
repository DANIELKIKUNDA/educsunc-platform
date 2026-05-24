import { AuditConflictException } from '../communes/AuditConflictException';

// Cette exception specialise un scenario d'erreur applicative Audit.
export class InvalidSynchronizationOrderException extends AuditConflictException {}
