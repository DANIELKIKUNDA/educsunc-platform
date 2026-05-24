import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditConflictDetected extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditConflictDetected'); } }
