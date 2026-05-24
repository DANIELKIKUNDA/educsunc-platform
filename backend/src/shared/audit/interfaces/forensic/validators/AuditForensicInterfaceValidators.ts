import { ValidationHttpAudit } from '../../http/validators/ValidationHttpAudit';
import type { AuditForensicInvestigationRequestDto } from '../dto';

export class AuditForensicInterfaceValidators {
  public static validerIdentifiant(params: unknown): { id: string } {
    const path = ValidationHttpAudit.obtenirObjet(params ?? {}, 'params');
    return {
      id: ValidationHttpAudit.lireChaineRequise(path, 'id'),
    };
  }

  public static validerRequete(
    query: unknown,
    typeInvestigation: AuditForensicInvestigationRequestDto['typeInvestigation'],
    id?: string,
  ): AuditForensicInvestigationRequestDto {
    const donnees = ValidationHttpAudit.obtenirObjet(query ?? {}, 'query');
    ValidationHttpAudit.validerTenant(donnees);
    ValidationHttpAudit.validerCorrelation(donnees);

    return {
      typeInvestigation,
      correlationId:
        typeInvestigation === 'CORRELATION' || typeInvestigation === 'CHRONOLOGY'
          ? id
          : ValidationHttpAudit.lireChaineOptionnelle(donnees, 'correlationId'),
      incidentId:
        typeInvestigation === 'INCIDENT'
          ? id
          : ValidationHttpAudit.lireChaineOptionnelle(donnees, 'incidentId'),
      acteurId:
        typeInvestigation === 'DEVICE'
          ? id
          : ValidationHttpAudit.lireChaineOptionnelle(donnees, 'acteurId'),
      adresseIp: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'adresseIp'),
    };
  }
}

