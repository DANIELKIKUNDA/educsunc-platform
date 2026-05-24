import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditExportGenerated extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditExportGenerated'); } }
