import type { AuditAnalyticsQuery } from 'shared/audit/application';
import { ValidationHttpAudit } from './ValidationHttpAudit';

export class AuditAnalyticsQueryValidator {
  public static valider(query: unknown): AuditAnalyticsQuery {
    const donnees = ValidationHttpAudit.obtenirObjet(query ?? {}, 'query');
    ValidationHttpAudit.validerTenant(donnees);
    return {
      periode: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'periode'),
      organisationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'organisationId'),
      ecoleId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'ecoleId'),
      typeAuditPrincipal: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'typeAuditPrincipal'),
    };
  }
}
