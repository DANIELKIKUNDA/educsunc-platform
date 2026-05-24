import { TenantAudit } from '../../../../domain/entities';
import { TenantAuditScope } from '../../../../domain/value-objects';
import type { AuditEntryRow } from './AuditPersistenceRecords';

// Ce mapper isole la reconstruction du contexte multi-tenant pour eviter toute fuite.
export class AuditTenantPersistenceMapper {
  public static versColonnes(entree: { idAuditEntry: string; tenantAudit: TenantAudit }): Pick<AuditEntryRow, 'organisation_id' | 'ecole_id' | 'scope'> {
    return {
      organisation_id: entree.tenantAudit.obtenirOrganisationId() ?? null,
      ecole_id: entree.tenantAudit.obtenirEcoleId() ?? null,
      scope: entree.tenantAudit.obtenirScope().obtenirValeur(),
    };
  }

  public static depuisColonnes(row: Pick<AuditEntryRow, 'id_audit_entry' | 'organisation_id' | 'ecole_id' | 'scope'>): TenantAudit {
    return new TenantAudit({
      idTenantAudit: `${row.id_audit_entry}-tenant`,
      scope: new TenantAuditScope(row.scope),
      organisationId: row.organisation_id ?? undefined,
      ecoleId: row.ecole_id ?? undefined,
    });
  }
}
