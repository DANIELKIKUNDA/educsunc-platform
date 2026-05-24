import { AuditForbiddenException } from '../communes/AuditForbiddenException';

// Cette exception specialise un scenario d'erreur applicative Audit.
export class AuditExportForbiddenException extends AuditForbiddenException {}
