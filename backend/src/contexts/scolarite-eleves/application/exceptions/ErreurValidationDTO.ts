import { ErreurApplication } from './ErreurApplication';

// Ce fichier contient l'erreur de validation des DTO entrants.
/**
 * Cette erreur indique qu'une entree applicative est incomplete ou invalide.
 */
export class ErreurValidationDTO extends ErreurApplication {
  constructor(message = 'Les donnees fournies au cas d usage sont invalides.') {
    super(message, 'ERREUR_VALIDATION_DTO_SCOLARITE_ELEVES');
    this.name = 'ErreurValidationDTO';
  }
}
