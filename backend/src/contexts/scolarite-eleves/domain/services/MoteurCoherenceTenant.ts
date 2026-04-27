import { ErreurOrganisationEcoleIncoherente } from '../exceptions/ErreurOrganisationEcoleIncoherente';
import { ErreurTenantInvalide } from '../exceptions/ErreurTenantInvalide';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier contient le service de domaine qui controle la coherence organisation/ecole.
/**
 * Ce moteur garantit que les objets manipules restent dans le meme tenant metier.
 */
export class MoteurCoherenceTenant {
  /** Verifie que les identifiants de tenant obligatoires sont presents. */
  public verifierTenantPresent(idOrganisation: UUID, idEcole: UUID): void {
    if (idOrganisation.trim().length === 0 || idEcole.trim().length === 0) {
      throw new ErreurTenantInvalide('L organisation et l ecole sont obligatoires pour une operation scolarite.');
    }
  }

  /** Verifie qu'un objet enfant appartient a la meme organisation et a la meme ecole que son parent. */
  public verifierMemeTenant(idOrganisationReference: UUID, idEcoleReference: UUID, idOrganisationObjet: UUID, idEcoleObjet: UUID): void {
    this.verifierTenantPresent(idOrganisationReference, idEcoleReference);
    this.verifierTenantPresent(idOrganisationObjet, idEcoleObjet);

    if (idOrganisationReference !== idOrganisationObjet || idEcoleReference !== idEcoleObjet) {
      throw new ErreurOrganisationEcoleIncoherente('Les objets compares doivent appartenir a la meme organisation et a la meme ecole.');
    }
  }
}
