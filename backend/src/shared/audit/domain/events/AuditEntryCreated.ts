import { EvenementDomaine } from '../../../domain/DomainEvent';
import type { TypeAuditValeur, GraviteAuditValeur, ResultatAuditValeur, ActionAuditValeur } from '../value-objects';

// Cet evenement central signale la création officielle d'une entrée audit.
export class AuditEntryCreated extends EvenementDomaine {
  constructor(
    public readonly idAudit: string,
    public readonly typeAuditPrincipal: TypeAuditValeur,
    public readonly categoriesAudit: readonly TypeAuditValeur[],
    public readonly action: ActionAuditValeur,
    public readonly acteurId: string,
    public readonly tenantScope: string,
    public readonly gravite: GraviteAuditValeur,
    public readonly resultat: ResultatAuditValeur,
    public readonly correlationId?: string,
  ) {
    super('AuditEntryCreated');
  }
}
