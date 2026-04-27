import { ErreurTenantApplication } from '../../application/exceptions/ErreurTenantApplication';

// Ce fichier contient les validations techniques de tenancy propres au BC Scolarite.
/**
 * Ce validateur evite les acces inter-ecoles et les incoherences tenant au niveau infrastructure.
 */
export class ScolariteTenantValidator {
  /** Verifie qu'un objet appartient a l'organisation et a l'ecole attendues. */
  public verifierAppartenanceEcole(idOrganisationAttendue: string, idEcoleAttendue: string, idOrganisationObjet: string, idEcoleObjet: string): void {
    if (idOrganisationAttendue !== idOrganisationObjet || idEcoleAttendue !== idEcoleObjet) {
      throw new ErreurTenantApplication('La ressource scolarite appartient a un autre tenant.');
    }
  }

  /** Verifie qu'un eleve charge appartient a l'ecole attendue. */
  public verifierEleveDansEcole(idEcoleAttendue: string, idEcoleEleve: string): void {
    if (idEcoleAttendue !== idEcoleEleve) {
      throw new ErreurTenantApplication('L eleve ne peut pas etre exploite depuis une autre ecole.');
    }
  }
}
