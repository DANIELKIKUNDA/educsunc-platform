import { ValidationHttpAudit } from '../../http/validators/ValidationHttpAudit';

export class AuditMonitoringInterfaceValidators {
  public static validerQuery(query: unknown): Record<string, unknown> {
    const donnees = ValidationHttpAudit.obtenirObjet(query ?? {}, 'query');
    ValidationHttpAudit.validerTenant(donnees);
    ValidationHttpAudit.validerCorrelation(donnees);
    return {
      periode: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'periode'),
      correlationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'correlationId'),
      metrique: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'metrique'),
    };
  }
}

