import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditSynchronizationCompleted extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditSynchronizationCompleted'); } }
