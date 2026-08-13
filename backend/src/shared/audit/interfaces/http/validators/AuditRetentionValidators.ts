import type { SearchAuditQuery } from 'shared/audit/application';
import { ValidationHttpAudit } from './ValidationHttpAudit';

export class AuditRetentionCommandValidator {
  public static valider(entree: unknown): SearchAuditQuery {
    const donnees = ValidationHttpAudit.obtenirObjet(entree ?? {}, 'body');
    ValidationHttpAudit.validerTenant(donnees);
    ValidationHttpAudit.validerPagination(donnees);
    return {
      page: ValidationHttpAudit.lireEntierDansBornes(donnees, 'page', 1, 10_000),
      taillePage: ValidationHttpAudit.lireEntierDansBornes(donnees, 'taillePage', 1, 500),
      organisationId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'organisationId'),
      ecoleId: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'ecoleId'),
      action: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'action'),
      gravite: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'gravite'),
      resultat: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'resultat'),
      dateFin: ValidationHttpAudit.lireDateIsoOptionnelle(donnees, 'dateFin'),
      raison: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'raison'),
    };
  }
}

export class AuditRetentionStatusValidator {
  public static valider(query: unknown): SearchAuditQuery {
    return AuditRetentionCommandValidator.valider(query);
  }
}
