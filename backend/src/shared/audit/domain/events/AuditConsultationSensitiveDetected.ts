import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditConsultationSensitiveDetected extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditConsultationSensitiveDetected'); } }
