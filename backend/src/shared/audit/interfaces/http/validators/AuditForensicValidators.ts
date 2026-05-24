import type { AuditForensicQuery } from 'shared/audit/application';
import { ValidationHttpAudit } from './ValidationHttpAudit';

export class AuditForensicCorrelationValidator {
  public static valider(params: unknown, query: unknown): AuditForensicQuery {
    const path = ValidationHttpAudit.obtenirObjet(params ?? {}, 'params');
    const donnees = ValidationHttpAudit.obtenirObjet(query ?? {}, 'query');
    ValidationHttpAudit.validerTenant(donnees);
    return {
      correlationId: ValidationHttpAudit.lireChaineRequise(path, 'id'),
      incidentId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'incidentId'),
      acteurId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'acteurId'),
      adresseIp: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'adresseIp'),
    };
  }
}

export class AuditForensicTimelineValidator {
  public static valider(params: unknown, query: unknown): AuditForensicQuery {
    return AuditForensicCorrelationValidator.valider(params, query);
  }
}

export class AuditForensicSessionValidator {
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

export class AuditForensicDeviceValidator {
  public static valider(params: unknown, query: unknown): AuditForensicQuery {
    const path = ValidationHttpAudit.obtenirObjet(params ?? {}, 'params');
    const donnees = ValidationHttpAudit.obtenirObjet(query ?? {}, 'query');
    ValidationHttpAudit.validerTenant(donnees);
    return {
      acteurId: ValidationHttpAudit.lireChaineRequise(path, 'id'),
      correlationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'correlationId'),
      incidentId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'incidentId'),
      adresseIp: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'adresseIp'),
    };
  }
}

export class AuditForensicIncidentValidator {
  public static valider(params: unknown, query: unknown): AuditForensicQuery {
    return AuditForensicSessionValidator.valider(params, query);
  }
}

export class AuditForensicSuspicionValidator {
  public static valider(query: unknown): AuditForensicQuery {
    const donnees = ValidationHttpAudit.obtenirObjet(query ?? {}, 'query');
    ValidationHttpAudit.validerTenant(donnees);
    ValidationHttpAudit.validerCorrelation(donnees);
    return {
      correlationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'correlationId'),
      incidentId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'incidentId'),
      acteurId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'acteurId'),
      adresseIp: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'adresseIp'),
    };
  }
}
