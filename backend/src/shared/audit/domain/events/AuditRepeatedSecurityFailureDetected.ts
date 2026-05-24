import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditRepeatedSecurityFailureDetected extends EvenementDomaine { constructor(public readonly acteurId: string, public readonly nombreEchecs: number) { super('AuditRepeatedSecurityFailureDetected'); } }
