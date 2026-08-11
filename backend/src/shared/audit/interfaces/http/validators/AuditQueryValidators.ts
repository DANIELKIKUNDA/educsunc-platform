import type { AuditTimelineQuery, SearchAuditQuery } from 'shared/audit/application';
import { ValidationHttpAudit } from './ValidationHttpAudit';

export class AuditListValidator {
  public static valider(query: unknown): SearchAuditQuery {
    const donnees = ValidationHttpAudit.obtenirObjet(query ?? {}, 'query');
    ValidationHttpAudit.validerPagination(donnees);
    ValidationHttpAudit.validerTenant(donnees);
    ValidationHttpAudit.validerCorrelation(donnees);
    const dateDebut = ValidationHttpAudit.lireDateIsoOptionnelle(donnees, 'dateDebut');
    const dateFin = ValidationHttpAudit.lireDateIsoOptionnelle(donnees, 'dateFin');
    if (dateDebut && dateFin && Date.parse(dateDebut) > Date.parse(dateFin)) {
      throw new Error('dateDebut doit preceder dateFin.');
    }

    return {
      page: ValidationHttpAudit.lireEntierQueryDansBornes(donnees, 'page', 1, 10_000),
      taillePage: ValidationHttpAudit.lireEntierQueryDansBornes(donnees, 'taillePage', 1, 100),
      cursor: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'cursor'),
      action: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'action'),
      typeAuditPrincipal: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'typeAuditPrincipal'),
      categorieAudit: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'categorieAudit'),
      gravite: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'gravite'),
      resultat: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'resultat'),
      acteurId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'acteurId'),
      ressourceId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'ressourceId'),
      typeRessource: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'typeRessource'),
      correlationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'correlationId'),
      requestId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'requestId'),
      sourceAudit: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'sourceAudit'),
      dateDebut,
      dateFin,
      organisationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'organisationId'),
      ecoleId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'ecoleId'),
    };
  }
}

export class AuditDetailValidator {
  public static valider(params: unknown, query: unknown): SearchAuditQuery {
    const path = ValidationHttpAudit.obtenirObjet(params ?? {}, 'params');
    const base = AuditListValidator.valider(query);
    return {
      ...base,
      idAuditEntry: ValidationHttpAudit.lireChaineRequise(path, 'id'),
    };
  }
}

export class AuditTimelineValidator {
  public static valider(query: unknown): AuditTimelineQuery {
    const donnees = ValidationHttpAudit.obtenirObjet(query ?? {}, 'query');
    ValidationHttpAudit.validerTenant(donnees);
    ValidationHttpAudit.validerCorrelation(donnees);
    ValidationHttpAudit.validerPagination(donnees);

    return {
      taillePage: ValidationHttpAudit.lireEntierQueryDansBornes(donnees, 'taillePage', 1, 100),
      cursor: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'cursor'),
      correlationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'correlationId'),
      categorieAudit: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'categorieAudit'),
      acteurId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'acteurId'),
      ressourceId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'ressourceId'),
      workflowId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'workflowId'),
      dateDebut: ValidationHttpAudit.lireDateIsoOptionnelle(donnees, 'dateDebut'),
      dateFin: ValidationHttpAudit.lireDateIsoOptionnelle(donnees, 'dateFin'),
      organisationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'organisationId'),
      ecoleId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'ecoleId'),
    };
  }
}

export class AuditHistoryValidator {
  public static valider(query: unknown): SearchAuditQuery {
    return AuditListValidator.valider(query);
  }
}
