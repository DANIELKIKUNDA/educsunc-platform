import { AuditForbiddenException } from '../communes/AuditForbiddenException';

// Cette exception specialise un scenario d'erreur applicative Audit.
export class AuditExportTooLargeException extends AuditForbiddenException {}
