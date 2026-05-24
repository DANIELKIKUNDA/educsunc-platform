import { EvenementDomaine } from '../../../domain/DomainEvent';
export class AuditRetentionExpired extends EvenementDomaine { constructor(public readonly idAudit: string) { super('AuditRetentionExpired'); } }
