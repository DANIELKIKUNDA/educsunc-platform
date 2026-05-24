import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditOfflineEntryCaptured extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditOfflineEntryCaptured'); } }
