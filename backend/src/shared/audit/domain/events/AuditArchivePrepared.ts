import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditArchivePrepared extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditArchivePrepared'); } }
