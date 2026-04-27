import { ErreurAccesTenantInterdit } from '../exceptions/ErreurAccesTenantInterdit';

// Ce fichier contient la regle qui encadre les lectures au niveau organisation.
/**
 * Cette policy autorise les lectures larges seulement pour un acteur organisationnel.
 */
export class PolicyLectureOrganisationnelle {
  /** Verifie que la lecture organisationnelle est autorisee par le contexte appelant. */
  public verifierLectureOrganisationnelleAutorisee(lectureOrganisationnelleAutorisee: boolean): void {
    if (!lectureOrganisationnelleAutorisee) {
      throw new ErreurAccesTenantInterdit('La lecture organisationnelle n est pas autorisee.');
    }
  }
}
