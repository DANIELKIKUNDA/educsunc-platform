import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditSensitiveActionDetected extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditSensitiveActionDetected'); } }
