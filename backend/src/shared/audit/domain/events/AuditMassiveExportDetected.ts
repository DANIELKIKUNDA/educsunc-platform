import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditMassiveExportDetected extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditMassiveExportDetected'); } }
