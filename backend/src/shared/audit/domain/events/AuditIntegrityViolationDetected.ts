import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditIntegrityViolationDetected extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditIntegrityViolationDetected'); } }
