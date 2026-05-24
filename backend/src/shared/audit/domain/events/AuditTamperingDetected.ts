import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditTamperingDetected extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditTamperingDetected'); } }
