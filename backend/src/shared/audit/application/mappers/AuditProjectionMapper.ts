import type { AuditEntryOutput } from '../dto/outputs/AuditEntryOutput';
import type { AuditSearchItemReadModel } from '../read-models/search/AuditSearchItemReadModel';
import type { AuditEntryDetailsReadModel } from '../read-models/consultation/AuditEntryDetailsReadModel';

// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditProjectionMapper {
  public static versSearchItem(valeur: AuditEntryOutput): AuditSearchItemReadModel {
    return {
      idAuditEntry: valeur.idAuditEntry,
      action: valeur.action,
      typeAuditPrincipal: valeur.typeAuditPrincipal,
      gravite: valeur.gravite,
      resultat: valeur.resultat,
      dateAction: valeur.dateAction,
    };
  }

  public static versDetails(valeur: AuditEntryOutput): AuditEntryDetailsReadModel {
    return {
      audit: valeur,
      metadata: valeur.metadata,
    };
  }
}
