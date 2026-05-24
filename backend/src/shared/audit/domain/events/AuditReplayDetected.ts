import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditReplayDetected extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditReplayDetected'); } }
