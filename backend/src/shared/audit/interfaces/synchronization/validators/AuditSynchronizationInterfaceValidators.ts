import { ValidationHttpAudit } from '../../http/validators/ValidationHttpAudit';

export class AuditSynchronizationInterfaceValidators {
  public static validerBody(corps: unknown): Record<string, unknown> {
    return ValidationHttpAudit.obtenirObjet(corps ?? {}, 'body');
  }

  public static validerQuery(query: unknown): Record<string, unknown> {
    const donnees = ValidationHttpAudit.obtenirObjet(query ?? {}, 'query');
    ValidationHttpAudit.validerTenant(donnees);
    ValidationHttpAudit.validerCorrelation(donnees);
    return donnees;
  }
}

