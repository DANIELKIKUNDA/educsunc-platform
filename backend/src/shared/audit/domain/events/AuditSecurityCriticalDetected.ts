import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditSecurityCriticalDetected extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditSecurityCriticalDetected'); } }
