import { ValidationHttpAudit } from '../../http/validators/ValidationHttpAudit';
import type {
  AuditExportCancellationDto,
  AuditExportExpirationDto,
  AuditExportRequestDto,
  AuditExportRecoveryDto,
} from '../dto';

const FORMATS = ['PDF', 'CSV', 'JSON'] as const;
const TYPES_EXPORT = ['AUDIT', 'FORENSIC', 'ANALYTICS'] as const;

export class AuditExportsInterfaceValidators {
  public static validerDemandeExport(corps: unknown): AuditExportRequestDto {
    const donnees = ValidationHttpAudit.obtenirObjet(corps, 'body');
    const format = ValidationHttpAudit.lireEnumOptionnel(donnees, 'format', FORMATS);
    const typeExport =
      ValidationHttpAudit.lireEnumOptionnel(donnees, 'typeExport', TYPES_EXPORT) ?? 'AUDIT';

    if (!format) {
      throw new Error('format est requis.');
    }

    return {
      format,
      typeExport,
      filtres: ValidationHttpAudit.lireRecordOptionnel(donnees, 'filtres'),
    };
  }

  public static validerIdentifiant(params: unknown): { exportId: string } {
    const path = ValidationHttpAudit.obtenirObjet(params ?? {}, 'params');
    return {
      exportId: ValidationHttpAudit.lireChaineRequise(path, 'id'),
    };
  }

  public static validerAnnulation(params: unknown, corps: unknown): AuditExportCancellationDto {
    const { exportId } = this.validerIdentifiant(params);
    const donnees = ValidationHttpAudit.obtenirObjet(corps ?? {}, 'body');
    return {
      exportId,
      annule: true,
      raison: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'raison'),
    };
  }

  public static validerExpiration(params: unknown, corps: unknown): AuditExportExpirationDto {
    const { exportId } = this.validerIdentifiant(params);
    const donnees = ValidationHttpAudit.obtenirObjet(corps ?? {}, 'body');
    return {
      exportId,
      expire: true,
      expirationAt: ValidationHttpAudit.lireChaineOptionnelle(donnees, 'expirationAt'),
    };
  }

  public static validerRestauration(params: unknown): AuditExportRecoveryDto {
    const { exportId } = this.validerIdentifiant(params);
    return {
      exportId,
      restaure: true,
    };
  }
}

