import { ValidationHttpAudit } from './ValidationHttpAudit';

export class AuditMonitoringQueryValidator {
  public static valider(query: unknown): Record<string, unknown> {
    const donnees = ValidationHttpAudit.obtenirObjet(query ?? {}, 'query');
    ValidationHttpAudit.validerTenant(donnees);
    return {
      periode: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'periode'),
      metrique: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'metrique'),
      correlationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'correlationId'),
    };
  }
}
