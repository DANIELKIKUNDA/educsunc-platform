import type { AuditForensicQuery, SearchAuditQuery } from 'shared/audit/application';
import { ValidationHttpAudit } from './ValidationHttpAudit';

export class AuditSecurityIncidentValidator {
  public static valider(params: unknown, query: unknown): AuditForensicQuery {
    const path = ValidationHttpAudit.obtenirObjet(params ?? {}, 'params');
    const donnees = ValidationHttpAudit.obtenirObjet(query ?? {}, 'query');
    ValidationHttpAudit.validerTenant(donnees);
    return {
      incidentId: ValidationHttpAudit.lireChaineRequise(path, 'id'),
      correlationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'correlationId'),
      acteurId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'acteurId'),
      adresseIp: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'adresseIp'),
    };
  }
}

export class AuditSecurityAnomaliesValidator {
  public static valider(query: unknown): SearchAuditQuery {
    return AuditQueryValidatorBase.valider(query);
  }
}

export class AuditSecurityAccessValidator {
  public static valider(query: unknown): SearchAuditQuery {
    return AuditQueryValidatorBase.valider(query);
  }
}

class AuditQueryValidatorBase {
  public static valider(query: unknown): SearchAuditQuery {
    const donnees = ValidationHttpAudit.obtenirObjet(query ?? {}, 'query');
    ValidationHttpAudit.validerTenant(donnees);
    ValidationHttpAudit.validerCorrelation(donnees);
    return {
      organisationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'organisationId'),
      ecoleId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'ecoleId'),
      correlationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'correlationId'),
      action: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'action'),
      gravite: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'gravite'),
      resultat: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'resultat'),
    };
  }
}
